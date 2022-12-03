import { Entity } from './Entity';

export type PositionXY = {
  x: number;
  y: number;
};

export default class Cell {
  position: PositionXY = { x: 0, y: 0 };
  entity: Entity;

  constructor(entity: Entity, position: PositionXY) {
    this.entity = entity;
    this.position = position;
  }

  isEqual(otherCell: Cell): boolean {
    return (
      this.entity.entityType === otherCell.entity.entityType &&
      this.position.x === otherCell.position.x &&
      this.position.y === otherCell.position.y
    );
  }
}
