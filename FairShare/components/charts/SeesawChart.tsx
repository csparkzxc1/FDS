import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';

interface Props {
  leftLabel: string;
  rightLabel: string;
  leftPct: number;
  rightPct: number;
  leftColor?: string;
  rightColor?: string;
}

const W = 260;
const H = 110;
const CX = W / 2;
const CY = 55;
const BEAM_LEN = 105;
const BALL_R = 18;

export function SeesawChart({
  leftLabel,
  rightLabel,
  leftPct,
  rightPct,
  leftColor = '#6366F1',
  rightColor = '#EC4899',
}: Props) {
  // tilt angle: positive = left heavier (left side goes down)
  const maxTilt = 18;
  const diff = (leftPct - rightPct) / 100;
  const tiltDeg = diff * maxTilt;
  const rad = (tiltDeg * Math.PI) / 180;

  const lx = CX - BEAM_LEN * Math.cos(rad);
  const ly = CY + BEAM_LEN * Math.sin(rad);
  const rx = CX + BEAM_LEN * Math.cos(rad);
  const ry = CY - BEAM_LEN * Math.sin(rad);

  // fulcrum triangle
  const triH = 20;
  const triW = 16;
  const triTop = CY + 2;
  const triPoints = `${CX},${triTop} ${CX - triW / 2},${triTop + triH} ${CX + triW / 2},${triTop + triH}`;

  return (
    <View className="items-center">
      <Svg width={W} height={H}>
        {/* Fulcrum */}
        <Polygon points={triPoints} fill="#D1D5DB" />
        {/* Beam */}
        <Line
          x1={lx}
          y1={ly}
          x2={rx}
          y2={ry}
          stroke="#6B7280"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Left ball */}
        <Circle cx={lx} cy={ly - BALL_R} r={BALL_R} fill={leftColor} opacity={0.9} />
        {/* Right ball */}
        <Circle cx={rx} cy={ry - BALL_R} r={BALL_R} fill={rightColor} opacity={0.9} />
      </Svg>
      <View className="flex-row justify-between" style={{ width: W - 20 }}>
        <View className="items-center" style={{ width: 80 }}>
          <Text className="text-sm font-bold" style={{ color: leftColor }}>
            {leftPct}%
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {leftLabel}
          </Text>
        </View>
        <View className="items-center" style={{ width: 80 }}>
          <Text className="text-sm font-bold" style={{ color: rightColor }}>
            {rightPct}%
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {rightLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
