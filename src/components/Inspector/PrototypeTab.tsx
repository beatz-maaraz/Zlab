import React from 'react';
import { Play } from 'lucide-react';
import { CanvasElement } from '../../types';

interface PrototypeTabProps {
  element: CanvasElement;
  allElements: Record<string, CanvasElement>;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onOpenPrototype?: () => void;
}

export const PrototypeTab: React.FC<PrototypeTabProps> = ({
  element,
  allElements,
  onUpdate,
  onOpenPrototype,
}) => {
  const proto = element.prototype || {
    trigger: 'tap',
    action: 'navigate',
    destinationId: '',
    animation: 'smart_animate',
    duration: 300,
    easing: 'ease-out',
  };

  const candidateScreens = (Object.values(allElements) as CanvasElement[]).filter(
    (el) => el.type === 'frame' || el.id.includes('screen') || el.id.includes('view')
  );

  return (
    <div className="p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#e5e2e1]">Interaction Node</span>
        {onOpenPrototype && (
          <button
            onClick={onOpenPrototype}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#34d399] hover:underline"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Preview Flow</span>
          </button>
        )}
      </div>

      {/* Trigger */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-[#89919e] uppercase font-bold">Trigger</label>
        <select
          value={proto.trigger}
          onChange={(e) =>
            onUpdate({
              prototype: { ...proto, trigger: e.target.value as any },
            })
          }
          className="w-full bg-[#141416] border border-[#353534] rounded-lg px-2.5 py-2 text-xs text-[#e5e2e1] outline-none"
        >
          <option value="tap">On Tap / Click</option>
          <option value="hover">While Hovering</option>
          <option value="drag">On Drag</option>
          <option value="delay">After Delay</option>
        </select>
      </div>

      {/* Action */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-[#89919e] uppercase font-bold">Action</label>
        <select
          value={proto.action}
          onChange={(e) =>
            onUpdate({
              prototype: { ...proto, action: e.target.value as any },
            })
          }
          className="w-full bg-[#141416] border border-[#353534] rounded-lg px-2.5 py-2 text-xs text-[#e5e2e1] outline-none"
        >
          <option value="navigate">Navigate To Frame</option>
          <option value="overlay">Open Overlay</option>
          <option value="back">Back to Previous</option>
          <option value="url">Open External Link</option>
        </select>
      </div>

      {/* Destination Screen */}
      {proto.action === 'navigate' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-[#89919e] uppercase font-bold">Destination</label>
          <select
            value={proto.destinationId}
            onChange={(e) =>
              onUpdate({
                prototype: { ...proto, destinationId: e.target.value },
              })
            }
            className="w-full bg-[#141416] border border-[#353534] rounded-lg px-2.5 py-2 text-xs text-[#e5e2e1] outline-none"
          >
            <option value="">Select target screen...</option>
            {candidateScreens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Animation & Easing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[10px] text-[#89919e] uppercase font-bold">Animation</label>
          <select
            value={proto.animation}
            onChange={(e) =>
              onUpdate({
                prototype: { ...proto, animation: e.target.value as any },
              })
            }
            className="w-full bg-[#141416] border border-[#353534] rounded-lg px-2 py-1.5 text-xs text-[#e5e2e1] outline-none"
          >
            <option value="smart_animate">Smart Animate</option>
            <option value="dissolve">Dissolve</option>
            <option value="slide_in">Slide In</option>
            <option value="instant">Instant</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-[#89919e] uppercase font-bold">Duration</label>
          <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
            <input
              type="number"
              min="50"
              max="2000"
              step="50"
              value={proto.duration}
              onChange={(e) =>
                onUpdate({
                  prototype: { ...proto, duration: parseInt(e.target.value, 10) || 300 },
                })
              }
              className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono text-xs"
            />
            <span className="text-[#89919e] text-[10px] ml-1">ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
