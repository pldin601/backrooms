// @flow
import type { Sector, Camera, Ray, Wall, RayCross } from './types';
import {
  PERSPECTIVE_WIDTH,
  PERSPECTIVE_HEIGHT,
  TEXTURE_MAP_SCALE,
  TEXTURE_TILE_WIDTH, TEXTURE_TILE_HEIGHT,
} from '../../consts';
import { crossTheWall } from './raycaster';
import { darken } from './color';
import { hasWallPortal, moveCameraInRelationToPortal } from './portal';
import { getDistanceBetweenPoints } from '../../util/geometry';

export const FOCUS_LENGTH = 0.8;
export const HEIGHT_RATIO = 1.3;
export const RENDER_DISTANCE = 4096;

export const DEFAULT_CEILING_COLOR = '#009aff';
export const DEFAULT_FLOOR_COLOR = '#2a2a2a';

function renderPortal(
  wall: Wall,
  sectors: Sector[],
  ray: Camera,
  camera: Camera,
  screenOffset: number,
  screenWidth: number,
  context: CanvasRenderingContext2D,
  textureImage: Image,
) {
  const { portal } = wall;

  if (portal === null || portal === undefined) {
    throw new Error(`Wall expected to have portal`);
  }

  const { sectorId, wallId } = portal;

  const thatWall = sectors[sectorId].walls[wallId];

  const movedCamera = moveCameraInRelationToPortal(wall, thatWall, camera);
  const movedRay = moveCameraInRelationToPortal(wall, thatWall, ray);

  renderColumn(
    sectorId,
    sectors,
    movedRay,
    movedCamera,
    screenOffset,
    screenWidth,
    context,
    textureImage,
  );
}

export function renderColumn(
  sectorId: number,
  sectors: Sector[],
  ray: Ray,
  camera: Camera,
  screenOffset: number,
  screenWidth: number,
  context: CanvasRenderingContext2D,
  textureImage: Image,
) {
  const currentSector = sectors[sectorId];

  let nearestWall = Infinity;

  for (const wall of currentSector.walls) {
    const rayCross = crossTheWall(ray, wall);

    if (
      rayCross === null ||
      rayCross.distance >= nearestWall ||
      rayCross.distance > RENDER_DISTANCE
    ) {
      continue;
    }

    nearestWall = rayCross.distance;

    const lensDistance = rayCross.distance * Math.cos(camera.angle - ray.angle);
    const heightScale = PERSPECTIVE_HEIGHT / lensDistance;
    const perspectiveHeight = heightScale * (currentSector.height / HEIGHT_RATIO);

    renderCeiling(context, camera, screenOffset, screenWidth, perspectiveHeight);
    renderFloor(context, camera, screenOffset, screenWidth, perspectiveHeight);

    if (hasWallPortal(wall)) {
      const sectorAfterPortal = sectors[wall.portal.sectorId];
      renderPortal(wall, sectors, ray, camera, screenOffset, screenWidth, context, textureImage);
      if (sectorAfterPortal.height < currentSector.height) {
        const portalPerspectiveHeight = heightScale * (sectorAfterPortal.height / HEIGHT_RATIO);
        // render top and bottom parts of wall
        context.save();
        context.beginPath();
        context.fillStyle = darken(wall.color, Math.sqrt(rayCross.distance) * 6);
        context.fillRect(
          screenOffset,
          0,
          screenWidth,
          PERSPECTIVE_HEIGHT / 2 - portalPerspectiveHeight,
        );
        context.fillRect(
          screenOffset,
          PERSPECTIVE_HEIGHT / 2 + portalPerspectiveHeight,
          screenWidth,
          PERSPECTIVE_HEIGHT / 2 + perspectiveHeight,
        );
        context.closePath();
        context.fill();
        context.restore();
      }
    } else {
      // Render wall
      const wallLength = getDistanceBetweenPoints(wall.p1, wall.p2);
      const textureOffset = TEXTURE_TILE_WIDTH * wall.texture;
      const textureColumnOffset = textureOffset + (wallLength * TEXTURE_MAP_SCALE * rayCross.offset) % TEXTURE_TILE_WIDTH;

      context.drawImage(
        textureImage,
        textureColumnOffset,
        1,
        1,
        TEXTURE_TILE_HEIGHT,
        screenOffset,
        PERSPECTIVE_HEIGHT / 2 - perspectiveHeight,
        1,
        perspectiveHeight * 2,
      );
    }
  }
}

export function renderSector(
  context: CanvasRenderingContext2D,
  sectorId: number,
  sectors: Sector[],
  camera: Camera,
  textureImage: Image,
) {
  for (let i = 0; i < PERSPECTIVE_WIDTH; i += 1) {
    const biasedFraction = i / PERSPECTIVE_WIDTH - 0.5;
    const angle = Math.atan2(biasedFraction, FOCUS_LENGTH) + camera.angle;
    const ray = {
      ...camera,
      angle,
    };
    renderColumn(sectorId, sectors, ray, camera, i, 1, context, textureImage);
  }
}

export function renderFloor(
  context: CanvasRenderingContext2D,
  camera: Camera,
  screenOffset: number,
  screenWidth: number,
  perspectiveHeight: number,
) {
  context.save();
  context.beginPath();
  context.fillStyle = DEFAULT_FLOOR_COLOR;
  context.fillRect(screenOffset, PERSPECTIVE_HEIGHT / 2, screenWidth, PERSPECTIVE_HEIGHT / 2);
  context.closePath();
  context.fill();
  context.restore();
}

export function renderCeiling(
  context: CanvasRenderingContext2D,
  camera: Camera,
  screenOffset: number,
  screenWidth: number,
  perspectiveHeight: number,
) {
  context.save();
  context.beginPath();
  context.fillStyle = DEFAULT_CEILING_COLOR;
  context.fillRect(screenOffset, 0, screenWidth, PERSPECTIVE_HEIGHT / 2);
  context.closePath();
  context.fill();
  context.restore();
}
