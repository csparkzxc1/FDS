import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const SIZE = 160;
const STROKE = 24;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutSlice[];
  centerLabel?: string;
  centerSub?: string;
}

export function DonutChart({ data, centerLabel, centerSub }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const slices = data.reduce<{ items: (DonutSlice & { dash: number; gap: number; rotation: number })[]; acc: number }>(
    ({ items, acc }, d) => {
      const pct = d.value / total;
      const dash = pct * CIRCUMFERENCE;
      return {
        items: [...items, { ...d, dash, gap: CIRCUMFERENCE - dash, rotation: acc * 360 - 90 }],
        acc: acc + pct,
      };
    },
    { items: [], acc: 0 },
  ).items;

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <View className="items-center">
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {slices.map((s, i) => (
            <G key={i} rotation={s.rotation} origin={`${cx}, ${cy}`}>
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeLinecap="butt"
              />
            </G>
          ))}
        </Svg>
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="items-center justify-center"
        >
          {centerLabel && (
            <Text className="text-xl font-bold text-gray-900">{centerLabel}</Text>
          )}
          {centerSub && (
            <Text className="text-xs text-gray-500 text-center px-2">{centerSub}</Text>
          )}
        </View>
      </View>
      <View className="flex-row flex-wrap justify-center gap-2 mt-3">
        {slices.map((s, i) => (
          <View key={i} className="flex-row items-center mx-1">
            <View
              className="rounded-full mr-1"
              style={{ width: 8, height: 8, backgroundColor: s.color }}
            />
            <Text className="text-xs text-gray-600">{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
