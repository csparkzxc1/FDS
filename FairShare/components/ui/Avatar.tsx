import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { Colors } from '@/constants/design-tokens';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

const sizeConfig: Record<AvatarSize, { dimension: number; fontSize: number; badgeSize: number }> = {
  xs: { dimension: 24, fontSize: 10, badgeSize: 8 },
  sm: { dimension: 32, fontSize: 13, badgeSize: 10 },
  md: { dimension: 44, fontSize: 17, badgeSize: 12 },
  lg: { dimension: 56, fontSize: 22, badgeSize: 14 },
  xl: { dimension: 80, fontSize: 30, badgeSize: 18 },
};

const avatarColors = [
  Colors.primary[500],
  Colors.success[500],
  Colors.warning[500],
  Colors.invisible[500],
  Colors.kid[500],
  '#F87171',
  '#34D399',
  '#60A5FA',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({
  uri,
  name = '',
  size = 'md',
  showBadge = false,
  badgeColor = Colors.success[500],
  style,
}: AvatarProps) {
  const { dimension, fontSize, badgeSize } = sizeConfig[size];
  const backgroundColor = getColorFromName(name || 'User');
  const initials = name ? getInitials(name) : '?';
  const borderRadius = dimension / 2;

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension, borderRadius }}
          accessibilityLabel={`${name}'s avatar`}
        />
      ) : (
        <View
          style={{ width: dimension, height: dimension, borderRadius, backgroundColor }}
          className="items-center justify-center"
          accessibilityLabel={`${name}'s avatar`}
        >
          <Text
            style={{ fontSize, color: Colors.white, fontWeight: '600', lineHeight: fontSize * 1.2 }}
          >
            {initials}
          </Text>
        </View>
      )}
      {showBadge && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: badgeColor,
            borderWidth: 1.5,
            borderColor: Colors.white,
          }}
        />
      )}
    </View>
  );
}

interface AvatarGroupProps {
  users: Array<{ name: string; avatarUrl?: string | null }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const { dimension } = sizeConfig[size];
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const overlap = Math.floor(dimension * 0.3);

  return (
    <View style={{ flexDirection: 'row', height: dimension }}>
      {visible.map((user, i) => (
        <View
          key={i}
          style={{
            marginLeft: i > 0 ? -overlap : 0,
            borderWidth: 1.5,
            borderColor: Colors.white,
            borderRadius: dimension / 2,
            zIndex: visible.length - i,
          }}
        >
          <Avatar uri={user.avatarUrl} name={user.name} size={size} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            marginLeft: -overlap,
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: Colors.gray[200],
            borderWidth: 1.5,
            borderColor: Colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
          }}
        >
          <Text style={{ fontSize: sizeConfig[size].fontSize * 0.85, color: Colors.gray[600], fontWeight: '600' }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
