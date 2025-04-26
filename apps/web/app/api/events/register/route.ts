import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { fullName, email, eventId } = await request.json();

    if (!fullName || !email || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, create or get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          email,
          full_name: fullName,
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Then, register for the event
    const { data: registration, error: registrationError } = await supabase
      .from('events_participants')
      .insert({
        event_id: eventId,
        profile_id: profile.id,
        status: 'registered',
      })
      .select()
      .single();

    if (registrationError) {
      if (registrationError.code === '23505') {
        return NextResponse.json(
          { error: 'Already registered for this event' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to register for event' },
        { status: 500 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
