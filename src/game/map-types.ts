import { IPoint } from '@/game/geometry-types';

export interface IWall {
  p1: IPoint;
  p2: IPoint;
  color: string;
  portal: IPortal | null;
  texture: number;
}

export interface IPortal {
  sectorId: number;
  wallId: number;
}

export interface ICamera {
  x: number;
  y: number;
  angle: number;
}
