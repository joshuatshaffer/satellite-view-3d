export const byObjectName = new Map<string, Satellite>();
export const byObjectId = new Map<string, Satellite>();
export const byNoradCatId = new Map<number, Satellite>();

export class Satellite {
  constructor(
    public readonly objectName: string,
    public readonly objectId: string,
    public readonly noradCatId: number,
    public readonly objectType: string,
    public readonly opsStatusCode: string,
    public readonly owner: string,
    public readonly launchDate: Date,
    public readonly launchSite: string,
    public readonly decayDate: Date | null,
    public readonly period: number | null,
    public readonly inclination: number | null,
    public readonly apogee: number | null,
    public readonly perigee: number | null,
    public readonly radarCrossSection: number | null,
    public readonly dataStatusCode: string,
    public readonly orbitCenter: string,
    public readonly orbitType: string
  ) {
    byObjectName.set(objectName, this);
    byObjectId.set(objectId, this);
    byNoradCatId.set(noradCatId, this);
  }
}
