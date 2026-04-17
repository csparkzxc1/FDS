import { describe, expect, it } from 'vitest';
import { haversineMeters, isWithinGeofence } from './geofence.util';

describe('haversineMeters', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMeters({ lat: 37.5665, lng: 126.978 }, { lat: 37.5665, lng: 126.978 })).toBe(0);
  });

  it('computes ~1113m between 0.01 degree latitude apart near Seoul', () => {
    const d = haversineMeters({ lat: 37.5665, lng: 126.978 }, { lat: 37.5765, lng: 126.978 });
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1120);
  });
});

describe('isWithinGeofence', () => {
  const seoulCityHall = { lat: 37.5665, lng: 126.978 };

  it('accepts points inside the radius', () => {
    expect(
      isWithinGeofence(
        { lat: 37.5666, lng: 126.9781 },
        { ...seoulCityHall, radiusMeters: 100 },
      ),
    ).toBe(true);
  });

  it('rejects points outside the radius', () => {
    expect(
      isWithinGeofence(
        { lat: 37.58, lng: 126.99 },
        { ...seoulCityHall, radiusMeters: 100 },
      ),
    ).toBe(false);
  });

  it('is inclusive on the boundary', () => {
    const near = { lat: 37.5665, lng: 126.978 };
    expect(isWithinGeofence(near, { ...seoulCityHall, radiusMeters: 0 })).toBe(true);
  });
});
