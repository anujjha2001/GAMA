'use client';

import React, { useState, useEffect } from 'react';
import { InteractiveBodyTwin3D } from './InteractiveBodyTwin3D';
import { OrganInspectorPanel, OrganData } from './OrganInspectorPanel';

interface BodyTwinModelProps {
  layer?: string;
  recoveryScore?: number;
  stressLevel?: number;
  selectedOrgan?: string | null;
  onSelectOrgan?: (organ: string | null) => void;
  heartRate?: number;
}

export default function BodyTwinModel({
  layer = 'Cardiovascular',
  selectedOrgan,
  onSelectOrgan,
}: BodyTwinModelProps) {
  const [organs, setOrgans] = useState<Record<string, OrganData>>({});
  const [activeOrgan, setActiveOrgan] = useState<OrganData | null>(null);

  useEffect(() => {
    fetch('/api/twin')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.organs) {
          setOrgans(data.organs);
          if (selectedOrgan && data.organs[selectedOrgan.toLowerCase()]) {
            setActiveOrgan(data.organs[selectedOrgan.toLowerCase()]);
          }
        }
      })
      .catch((err) => console.error('Error fetching twin data in BodyTwinModel:', err));
  }, [selectedOrgan]);

  const handleOrganSelection = (organ: OrganData | null) => {
    setActiveOrgan(organ);
    if (onSelectOrgan) {
      onSelectOrgan(organ ? organ.id : null);
    }
  };

  const systemFilterMap: Record<string, string> = {
    Cardiovascular: 'cardiovascular',
    'Nervous System': 'nervous',
    Muscular: 'musculoskeletal',
    Skeletal: 'musculoskeletal',
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-center items-center">
      <InteractiveBodyTwin3D
        organs={organs}
        selectedOrgan={activeOrgan}
        onSelectOrgan={handleOrganSelection}
        systemFilter={systemFilterMap[layer] || 'all'}
      />

      {activeOrgan && (
        <div className="absolute top-4 right-4 z-50 max-w-sm">
          <OrganInspectorPanel
            organ={activeOrgan}
            onClose={() => handleOrganSelection(null)}
            onRefreshData={() => {
              fetch('/api/twin')
                .then((r) => r.json())
                .then((d) => d.success && setOrgans(d.organs));
            }}
          />
        </div>
      )}
    </div>
  );
}
