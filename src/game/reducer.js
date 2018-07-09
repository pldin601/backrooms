// @flow
import { scan } from 'rxjs/operators';
import type { GameStateInterface, KeysStateInterface, PlayerStateInterface } from './state';
import initialState from './initial-state';
import { PLAYER_TURN_STEP, PLAYER_SPEED } from '../consts';
import type { Map } from './core/types';
import { movePlayerOnMap } from './interact/move';

function movePlayerPosition(
  player: PlayerStateInterface,
  map: Map,
  moveSpeed: number,
  moveAngle: number,
) {
  const playerSector = map.sectors[player.position.sectorId];
  player.position = movePlayerOnMap(
    player.position,
    moveSpeed,
    moveAngle,
    player.position.sectorId,
    playerSector,
    map,
  );
}

function movePlayer(
  { player, map }: GameStateInterface,
  keysState: KeysStateInterface,
  deltaMs: number,
) {
  const walkSpeed = (PLAYER_SPEED / 16) * deltaMs;
  const turnSpeed = (PLAYER_TURN_STEP / 16) * deltaMs;

  // Forward
  if (keysState.ArrowUp) {
    movePlayerPosition(player, map, walkSpeed, player.position.angle);
  }

  // Backward
  if (keysState.ArrowDown) {
    movePlayerPosition(player, map, walkSpeed, player.position.angle - Math.PI);
  }

  if (keysState.Alt) {
    // Strafe left
    if (keysState.ArrowLeft) {
      movePlayerPosition(player, map, walkSpeed, player.position.angle - Math.PI / 2);
    }

    // Strafe right
    if (keysState.ArrowRight) {
      movePlayerPosition(player, map, walkSpeed, player.position.angle + Math.PI / 2);
    }
  } else {
    // Turn left
    if (keysState.ArrowLeft) {
      player.position.angle -= turnSpeed;
    }

    // Turn right
    if (keysState.ArrowRight) {
      player.position.angle += turnSpeed;
    }
  }
}

interface ReducerState {
  time: number;
  state: GameStateInterface;
}

function reduce({ time, state }: ReducerState, keysState: KeysStateInterface): ReducerState {
  const now = Date.now();
  movePlayer(state, keysState, now - time);
  return { time: now, state };
}

export function createGameReducer() {
  return scan(reduce, { time: Date.now(), state: initialState });
}
