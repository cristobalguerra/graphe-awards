"use client";

import { useState } from "react";
import VoteAccess from "@/components/voting/VoteAccess";
import VoteBallot from "@/components/voting/VoteBallot";
import { type JuryAccess } from "@/lib/voting";

export default function VotarPage() {
  const [juror, setJuror] = useState<JuryAccess | null>(null);

  if (!juror) {
    return <VoteAccess onAccess={setJuror} />;
  }

  return <VoteBallot juror={juror} />;
}
