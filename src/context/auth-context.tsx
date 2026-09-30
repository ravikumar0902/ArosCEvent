'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Membership, Society, Role } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { DEMO_SOCIETY, DEMO_PROFILES, DEMO_MEMBERSHIPS } from '@/lib/demo/demo-data';

interface AuthContextType {
  user: Profile | null;
  currentSociety: Society | null;
  currentMembership: Membership | null;
  role: Role;
  societies: Society[];
  memberships: Membership[];
  isLoading: boolean;
  isAdmin: boolean;
  isStageManager: boolean;
  isVolunteer: boolean;
  isJudge: boolean;
  isResident: boolean;
  switchRole: (role: Role) => void;
  switchSociety: (societyId: string) => void;
  updateSociety: (updates: Partial<Society>) => Society;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(DEMO_PROFILES[0]); // default to admin
  const [currentSociety, setCurrentSociety] = useState<Society | null>(DEMO_SOCIETY);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(DEMO_MEMBERSHIPS[0]);
  const [societies, setSocieties] = useState<Society[]>([DEMO_SOCIETY]);
  const [memberships, setMemberships] = useState<Membership[]>(DEMO_MEMBERSHIPS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Refresh societies and user state from DB
    const socs = db.getSocieties();
    setSocieties(socs);
    if (!currentSociety && socs.length > 0) {
      setCurrentSociety(socs[0]);
    }

    const unsub = db.subscribe((event) => {
      if (event === 'SOCIETY_CREATED' || event === 'SOCIETY_UPDATED' || event === 'RESET') {
        const freshSocs = db.getSocieties();
        setSocieties(freshSocs);
        if (currentSociety) {
          const fresh = freshSocs.find((s) => s.id === currentSociety.id);
          if (fresh) setCurrentSociety(fresh);
        }
      }
    });

    return () => unsub();
  }, [currentSociety]);

  // Handle demo role switching
  const switchRole = (newRole: Role) => {
    setIsLoading(true);
    let targetProfileId = 'prof-admin';

    switch (newRole) {
      case 'society_admin':
      case 'platform_super_admin':
        targetProfileId = 'prof-admin';
        break;
      case 'stage_manager':
      case 'event_manager':
        targetProfileId = 'prof-stage';
        break;
      case 'volunteer':
        targetProfileId = 'prof-volunteer';
        break;
      case 'judge':
        targetProfileId = 'prof-judge';
        break;
      case 'resident':
        targetProfileId = 'prof-resident';
        break;
    }

    const prof = db.getProfile(targetProfileId);
    if (prof) {
      setUser(prof);
      const mems = db.getMemberships(currentSociety?.id);
      const mem = mems.find((m) => m.profile_id === prof.id);
      if (mem) {
        setCurrentMembership(mem);
      } else {
        // synthesize temporary membership if not found
        setCurrentMembership({
          id: `mem-synth-${newRole}`,
          society_id: currentSociety?.id || DEMO_SOCIETY.id,
          profile_id: prof.id,
          role: newRole,
          status: 'active',
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
    setIsLoading(false);
  };

  const switchSociety = (societyId: string) => {
    const soc = db.getSociety(societyId);
    if (soc) {
      setCurrentSociety(soc);
      // update membership for active user in that society
      if (user) {
        const mems = db.getMemberships(soc.id);
        const mem = mems.find((m) => m.profile_id === user.id);
        if (mem) setCurrentMembership(mem);
      }
    }
  };

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const profs = db.getProfiles();
    const found = profs.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      const mems = db.getMemberships(currentSociety?.id);
      const mem = mems.find((m) => m.profile_id === found.id);
      if (mem) setCurrentMembership(mem);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const updateSociety = (updates: Partial<Society>): Society => {
    if (!currentSociety) throw new Error('No active society selected');
    const updated = db.updateSociety(currentSociety.id, updates, user?.id);
    setCurrentSociety(updated);
    setSocieties(db.getSocieties());
    return updated;
  };

  const logout = () => {
    // Reset to demo resident
    switchRole('resident');
  };

  const role: Role = currentMembership?.role || 'resident';
  const isAdmin = role === 'society_admin' || role === 'platform_super_admin';
  const isStageManager = isAdmin || role === 'stage_manager' || role === 'event_manager';
  const isVolunteer = isStageManager || role === 'volunteer';
  const isJudge = role === 'judge';
  const isResident = true; // All members have resident capabilities

  return (
    <AuthContext.Provider
      value={{
        user,
        currentSociety,
        currentMembership,
        role,
        societies,
        memberships,
        isLoading,
        isAdmin,
        isStageManager,
        isVolunteer,
        isJudge,
        isResident,
        switchRole,
        switchSociety,
        updateSociety,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
