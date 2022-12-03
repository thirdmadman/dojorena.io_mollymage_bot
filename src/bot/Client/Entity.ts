import { EntityType, EntityTypeFromString } from './EntityTypes';

export class Entity {
  entityType: EntityType;
  constructor(value: string) {
    const getKeyByValue = (value: string) => {
      const indexOfS = Object.values(EntityTypeFromString).indexOf(value as unknown as EntityTypeFromString);
      const key = Object.keys(EntityTypeFromString)[indexOfS] as EntityTypeFromString;
      return key;
    };
    const key = getKeyByValue(value) as unknown as EntityType;
    this.entityType = EntityType[key];
  }
}
