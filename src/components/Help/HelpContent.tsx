import React from 'react';

export const HelpContent: React.FC = () => {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <section>
        <h3 className="text-base font-semibold text-white mb-1">How to use this app</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Drag exercises from the library into a training day.</li>
          <li>Pick a goal per exercise (power, strength, hypertrophy, endurance).</li>
          <li>Adjust sets, rep range, rest, and RiR for each planned exercise.</li>
          <li>Use the right panel to review weekly and daily muscle volume.</li>
          <li>Export your plan as JSON/PDF or copy it for an LLM review.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-1">Training principles</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Start sessions with large compound lifts, then move to isolation work.</li>
          <li>Most people progress with roughly 10-20 hard sets per muscle per week.</li>
          <li>Power and strength work favor lower reps and longer rests.</li>
          <li>Hypertrophy focuses on moderate reps and controlled proximity to failure.</li>
          <li>Endurance focuses on higher reps, shorter rests, and local fatigue tolerance.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-1">Beginner vs advanced focus</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Beginners should prioritize technique, consistency, and manageable weekly volume.</li>
          <li>Intermediate athletes can add targeted volume and more specific goal blocks.</li>
          <li>Advanced athletes usually need tighter fatigue management and precise progression.</li>
          <li>Use RiR to control effort and improve recovery quality across the week.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-1">What is RiR?</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>RiR means Reps in Reserve: how many good reps you could still do before failure.</li>
          <li>RiR 2 means you stop the set with roughly 2 reps left in the tank.</li>
          <li>Lower RiR is harder and increases fatigue; higher RiR is easier and supports recovery.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-1">Feature overview</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Recovery tab: track status codes Fr/Rc/Fa with colorblind-safe colors and a cycling-view toggle.</li>
          <li>Periodization controls: configure cycle length, upramp, overreach, and deload from the top bar.</li>
          <li>PDF exports: generate a weekly summary PDF or a full-period PDF with tracking fields per session.</li>
          <li>Cardio and interval blocks: select HR% zone presets while target BPM is auto-calculated and read-only.</li>
          <li>Plyometric blocks: plan jump and explosive sessions with a dedicated block type.</li>
        </ul>
      </section>
    </div>
  );
};
