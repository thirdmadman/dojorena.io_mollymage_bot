import { EntityType } from './EntityTypes';
import Cell, { PositionXY } from './Cell';
import { Entity } from './Entity';
import { COMMANDS_MOVEMENT } from './Commands';

export default class Board {
  src: string;
  boardArray: Array<Cell>;
  boardSize = 0;

  blastLength = 4;

  constructor(message: string) {
    this.src = this.parseBoard(message);
    this.boardSize = this.getBoardSize(this.src);
    this.boardArray = this.getBoardArray(this.src);
  }

  private getBoardSize = (parsedBoard: string) => {
    return Math.sqrt(parsedBoard.length);
  };

  private parseBoard = (message: string) => {
    const pattern = new RegExp(/^board=(.*)$/);
    const parameters = message.match(pattern) || '';
    return parameters[1];
  };

  private getBoardArray = (bardString: string) => {
    const boardSrc = bardString.split('');
    const size = this.boardSize;
    const boardArray = [];
    for (var i = 0; i < size; i++) {
      const sliceStart = size * i;
      const sliceEnd = size * (i + 1);
      const lineOfSrc = boardSrc.slice(sliceStart, sliceEnd);
      const lineOfCells = lineOfSrc.map((el, x) => {
        const entity = new Entity(el);
        return new Cell(entity, { x, y: i });
      });
      boardArray.push(...lineOfCells);
    }
    return boardArray;
  };

  public getBoardText = () => {
    const boardSrc = this.src.split('');
    const size = this.boardSize;
    let boardString = '';
    for (var i = 0; i < size; i++) {
      const sliceStart = size * i;
      const sliceEnd = size * (i + 1);
      const lineOfSrc = boardSrc.slice(sliceStart, sliceEnd);
      boardString += `${lineOfSrc.join('')}\n`;
    }

    return boardString;
  };

  public getAllCellsWithEntity = (entityTypeArray: Array<EntityType>) => {
    const isAny = (entityCurrent: EntityType, entityArrayToCompare: Array<EntityType>) => {
      return entityArrayToCompare.find((el) => el === entityCurrent) ? true : false;
    };
    return this.boardArray.filter((cell) => isAny(cell.entity.entityType, entityTypeArray));
  };

  public getMyCurrentCell = (isOnlyAlive: boolean) => {
    const myHeroTypesAlive = [EntityType.HERO, EntityType.HERO_POTION];
    const myHeroTypesAll = myHeroTypesAlive.concat(EntityType.HERO_DEAD);

    return isOnlyAlive ? this.getAllCellsWithEntity(myHeroTypesAlive)[0] : this.getAllCellsWithEntity(myHeroTypesAll)[0];
  };

  public getCellByPositionXY = (positionXY: PositionXY) => {
    return this.boardArray.find((cell) => cell.position.x === positionXY.x && cell.position.y === positionXY.y) || null;
  };

  public getCellByPosition = (x: number, y: number) => {
    return this.getCellByPositionXY({ x, y } as PositionXY) || null;
  };

  public getCrossAroundCells = (currentCell: Cell) => {
    const aroundCells = Array<Cell>();
    if (!currentCell) return aroundCells;

    const currentPosition = currentCell.position;

    if (currentPosition.x > 0) {
      const cell = this.getCellByPosition(currentPosition.x - 1, currentPosition.y);
      cell && aroundCells.push(cell);
    }
    if (currentPosition.x < this.boardSize - 1) {
      const cell = this.getCellByPosition(currentPosition.x + 1, currentPosition.y);
      cell && aroundCells.push(cell);
    }
    if (currentPosition.y > 0) {
      const cell = this.getCellByPosition(currentPosition.x, currentPosition.y - 1);
      cell && aroundCells.push(cell);
    }
    if (currentPosition.y < this.boardSize - 1) {
      const cell = this.getCellByPosition(currentPosition.x, currentPosition.y + 1);
      cell && aroundCells.push(cell);
    }

    return aroundCells;
  };

  public getFreeAroundCells = (currentCell: Cell, isCellsForMyHero: boolean) => {
    const commonTypes = [
      EntityType.NONE,
      EntityType.ENEMY_HERO_DEAD,
      EntityType.OTHER_HERO_DEAD,
      EntityType.BLAST,
      EntityType.POTION_TIMER_2,
      EntityType.POTION_TIMER_3,
      EntityType.POTION_TIMER_4,
      EntityType.POTION_TIMER_5,
    ];

    const typesForMyHero = [
      ...commonTypes,
      EntityType.POTION_BLAST_RADIUS_INCREASE,
      EntityType.POTION_COUNT_INCREASE,
      EntityType.POTION_REMOTE_CONTROL,
      EntityType.POTION_IMMUNE,
      EntityType.POISON_THROWER,
      EntityType.POTION_EXPLODER,
    ];

    const typesForEnemy = [...commonTypes, EntityType.ENEMY_HERO, EntityType.OTHER_HERO, EntityType.HERO, EntityType.HERO_DEAD];
    const crossAroundCells = this.getCrossAroundCells(currentCell);

    return crossAroundCells.filter((cell) => {
      if (cell && cell.entity) {
        if (isCellsForMyHero) {
          return typesForMyHero.find((type) => type === cell.entity.entityType) || false;
        } else {
          return typesForEnemy.find((type) => type === cell.entity.entityType) || false;
        }
      }
      return false;
    });
  };

  public getAvailableMoves = (currentCell: Cell, freeAroundCells: Array<Cell>) => {
    if (!currentCell) {
      return [];
    }
    const currentPosition = currentCell.position;

    return freeAroundCells.map((cell) => {
      if (cell.position.x < currentPosition.x) {
        return COMMANDS_MOVEMENT.LEFT;
      }
      if (cell.position.x > currentPosition.x) {
        return COMMANDS_MOVEMENT.RIGHT;
      }
      if (cell.position.y < currentPosition.y) {
        return COMMANDS_MOVEMENT.UP;
      }
      if (cell.position.y > currentPosition.y) {
        return COMMANDS_MOVEMENT.DOWN;
      }
    });
  };

  public getMyAvailableMoves = () => {
    const myCurrentCell = this.getMyCurrentCell(true);
    const cellsAround = this.getFreeAroundCells(myCurrentCell, true);
    return this.getAvailableMoves(myCurrentCell, cellsAround);
  };

  public changeOneValueOfPosition = (axis: string, number: number, positionXY: PositionXY) => {
    const newPositionXY = { x: 0, y: 0 } as PositionXY;
    newPositionXY.x = positionXY.x;
    newPositionXY.y = positionXY.y;

    if ((axis === 'x' || axis === 'y') && number !== 0) {
      newPositionXY[axis] = positionXY[axis] + number;
    }

    return newPositionXY;
  };

  public getCellsBlastPredicted = (potionCell: Cell) => {
    let cellsBlastPredicted = new Array<Cell>();

    const traceExplosion = (direction: string, way: number, startPositionXY: PositionXY) => {
      let explosionTrace = new Array<Cell>();

      if ((direction === 'x' || direction === 'y') && (way === -1 || way === 1)) {
        for (let cellsCount = 1; cellsCount <= this.blastLength; cellsCount++) {
          let newPositionXY = this.changeOneValueOfPosition(direction, way * cellsCount, startPositionXY);
          let newCell = this.getCellByPositionXY(newPositionXY);
          if (newCell && newCell.entity.entityType !== EntityType.WALL) {
            explosionTrace.push(newCell);
          } else {
            break;
          }
        }
      }
      return explosionTrace;
    };

    const axes = ['x', 'y'];
    const ways = [-1, 1];

    axes.forEach((axis) => ways.forEach((way) => cellsBlastPredicted.push(...traceExplosion(axis, way, potionCell.position))));
    return cellsBlastPredicted;
  };

  public getGhostsPredictedPositionCells() {
    const ghostsPredictedPositionCells = new Array<Cell>();
    const cellsWithGhost = this.getAllCellsWithEntity([EntityType.GHOST, EntityType.GHOST_DEAD]);

    const predictGhostPosition = (ghostCell: Cell) => {
      return this.getFreeAroundCells(ghostCell, false);
    };

    cellsWithGhost.forEach((cellWithGhost) => {
      ghostsPredictedPositionCells.push(...predictGhostPosition(cellWithGhost));
    });

    return ghostsPredictedPositionCells;
  }

  public getDangerousCellsInNextMove = () => {
    let dangerousCellsInNextMove = new Array<Cell>();
    const potionsWillExplode = this.getAllCellsWithEntity([EntityType.POTION_TIMER_1]);
    potionsWillExplode.forEach((potionCell) => dangerousCellsInNextMove.push(...this.getCellsBlastPredicted(potionCell)));

    const ghostsPredictedPosition = this.getGhostsPredictedPositionCells();
    dangerousCellsInNextMove.push(...ghostsPredictedPosition);

    return dangerousCellsInNextMove;
  };

  public getSafeInNextMoveCellsFromArray = (srcCells: Array<Cell>) => {
    const dangerousCellsInNextMove = this.getDangerousCellsInNextMove();
    return srcCells.filter((cell) => {
      return !(dangerousCellsInNextMove.find((dangerousCell) => dangerousCell.isEqual(cell)) || false);
    });
  };

  public getMySafeAvailableMoves = () => {
    const myCurrentCell = this.getMyCurrentCell(true);
    const cellsAround = this.getSafeInNextMoveCellsFromArray(this.getFreeAroundCells(myCurrentCell, true));
    return this.getAvailableMoves(myCurrentCell, cellsAround).filter((cell) => cell);
  };

  public isHeroDead = () => {
    const heroCell = this.getAllCellsWithEntity([EntityType.HERO_DEAD]);
    if (heroCell && heroCell.length !== 0) {
      return true;
    }
    return false;
  };

  public getCellsInLine = (axis: 'x' | 'y', direction: -1 | 1, length: number, startPositionXY: PositionXY) => {
    const cellsInLine = new Array<Cell>();
    for (let count = 0; count < length; count++) {
      const newPositionXY = this.changeOneValueOfPosition(axis, direction * count, startPositionXY);
      const cell = this.getCellByPositionXY(newPositionXY);
      if (cell) {
        cellsInLine.push(cell);
      }
    }

    return cellsInLine;
  };

  public removeDuplicateCells = (srcCells: Array<Cell>) => {
    return srcCells.filter((cellToFind, index, cellsArray) => cellsArray.findIndex((cell) => cell.isEqual(cellToFind)) === index);
  };

  public getAllCellsAround = (currentCell: Cell, radius: number) => {
    const cellsAround = new Array<Cell>();

    let startPositionXY = this.changeOneValueOfPosition('x', -radius, currentCell.position);
    startPositionXY = this.changeOneValueOfPosition('y', -radius, currentCell.position);

    let endPositionXY = this.changeOneValueOfPosition('x', radius, currentCell.position);
    endPositionXY = this.changeOneValueOfPosition('y', radius, currentCell.position);

    const countInLine = radius * 2 - 1;

    cellsAround.push(...this.getCellsInLine('x', 1, countInLine, startPositionXY));
    cellsAround.push(...this.getCellsInLine('y', -1, countInLine, startPositionXY));
    cellsAround.push(...this.getCellsInLine('x', -1, countInLine, endPositionXY));
    cellsAround.push(...this.getCellsInLine('y', 1, countInLine, endPositionXY));

    return this.removeDuplicateCells(cellsAround);
  };

  public getMagneticDirections = () => {
    const myCurrentCell = this.getMyCurrentCell(false);
    const myCurrentPositionXY = myCurrentCell.position;

    let possibleMoves = new Array<COMMANDS_MOVEMENT>();

    for (let radius = 2; radius < 10; radius++) {
      const cellsAround = this.getAllCellsAround(myCurrentCell, radius);
      const usefulTypes = [EntityType.POTION_IMMUNE, EntityType.OTHER_HERO, EntityType.TREASURE_BOX];
      const usefulCells = cellsAround.filter((cell) => (usefulTypes.find((type) => type === cell.entity.entityType) || false));
      // console.log(usefulCells);

      if (usefulCells && usefulCells.length > 0) {

        // const cell = usefulCells[0];

        for (let cell of usefulCells) {
          const cellPosition = cell.position;
          const xDiff = cellPosition.x - myCurrentPositionXY.x;
          const yDiff = cellPosition.y - myCurrentPositionXY.y;

          let isWallOnTrace = true;

          if ((xDiff !== 0 && yDiff === 0) || (xDiff === 0 && yDiff !== 0)) {
            let traceToCell = new Array<Cell>();
            if (xDiff === 0) {
              traceToCell = this.getCellsInLine('y', yDiff / Math.abs(yDiff) as (-1 | 1), Math.abs(yDiff), myCurrentPositionXY );
            } else {
              traceToCell = this.getCellsInLine('x', xDiff / Math.abs(xDiff) as (-1 | 1), Math.abs(xDiff), myCurrentPositionXY );
            }
            
            isWallOnTrace = traceToCell.find((cell) => cell.entity.entityType === EntityType.WALL) ? true : false;
          } else {
            let traceToCell = new Array<Cell>();
            if (Math.abs(yDiff) > Math.abs(xDiff)) {
              traceToCell = this.getCellsInLine('x', xDiff / Math.abs(xDiff) as (-1 | 1), Math.abs(xDiff) + 1, myCurrentPositionXY );
              const newPositionXY = this.changeOneValueOfPosition('x', xDiff, myCurrentPositionXY);
              traceToCell.push(...this.getCellsInLine('y', yDiff / Math.abs(yDiff) as (-1 | 1), Math.abs(yDiff) + 1, newPositionXY ));
            } else {
              traceToCell = this.getCellsInLine('y', yDiff / Math.abs(yDiff) as (-1 | 1), Math.abs(yDiff), myCurrentPositionXY );
              const newPositionXY = this.changeOneValueOfPosition('y', yDiff, myCurrentPositionXY);
              traceToCell.push(...this.getCellsInLine('x', xDiff / Math.abs(xDiff) as (-1 | 1), Math.abs(xDiff), newPositionXY ));
            }
            isWallOnTrace = traceToCell.find((cell) => cell.entity.entityType === EntityType.WALL) ? true : false;
          }

          if (!isWallOnTrace) {
            if (cell.position.x < myCurrentPositionXY.x) {
              possibleMoves.push(COMMANDS_MOVEMENT.LEFT);
            }
            if (cell.position.x > myCurrentPositionXY.x) {
              possibleMoves.push(COMMANDS_MOVEMENT.RIGHT);
            }
            if (cell.position.y < myCurrentPositionXY.y) {
              possibleMoves.push(COMMANDS_MOVEMENT.UP);
            }
            if (cell.position.y > myCurrentPositionXY.y) {
              possibleMoves.push(COMMANDS_MOVEMENT.DOWN);
            }
            break;
          }

        }
        return possibleMoves;
      }
    }

    return possibleMoves;
  };
}
