"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Github, Twitter, Linkedin, Users2 } from "lucide-react";

const members = [
  {
    id: 1,
    name: "Riza Fahmi",
    role: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "Bandar Lampung",
    skills: ["React", "TypeScript", "Node.js"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    social: {
      github: "https://github.com/rizafahmi",
      twitter: "https://twitter.com/rizafahmi",
      linkedin: "https://linkedin.com/in/rizafahmi"
    }
  },
  {
    id: 2,
    name: "Sarah Drasana",
    role: "Backend Developer",
    company: "Startup XYZ",
    location: "Metro",
    skills: ["Python", "Django", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    social: {
      github: "https://github.com/sarahdrasana",
      twitter: "https://twitter.com/sarahdrasana",
      linkedin: "https://linkedin.com/in/sarahdrasana"
    }
  },
  {
    id: 3,
    name: "Ahmad Zaky",
    role: "Full Stack Developer",
    company: "Freelancer",
    location: "Bandar Lampung",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    social: {
      github: "https://github.com/ahmadzaky",
      twitter: "https://twitter.com/ahmadzaky",
      linkedin: "https://linkedin.com/in/ahmadzaky"
    }
  },
  {
    id: 4,
    name: "Linda Putri",
    role: "UI/UX Designer",
    company: "Design Studio",
    location: "Pringsewu",
    skills: ["Figma", "Adobe XD", "UI Design", "UX Research"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    social: {
      github: "https://github.com/lindaputri",
      twitter: "https://twitter.com/lindaputri",
      linkedin: "https://linkedin.com/in/lindaputri"
    }
  }
];

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Anggota Komunitas</h1>
          <p className="text-muted-foreground">Temukan dan terhubung dengan sesama developer di Lampung</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama, role, lokasi, atau skill..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members Grid or Empty State */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-primary">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.company}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  📍 {member.location}
                </p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Users2 className="h-24 w-24 text-muted-foreground" />
                <Search className="h-12 w-12 absolute bottom-0 right-0 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Tidak Ada Anggota Ditemukan</h3>
            <p className="text-muted-foreground mb-8">
              Tidak ada anggota yang sesuai dengan kriteria pencarian Anda.
              {searchQuery && ` Coba cari dengan kata kunci yang berbeda.`}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")}>
                Reset Pencarian
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}