export class Time {
  public readonly dependents = new Set<{ needsUpdate: boolean }>();

  public date = new Date();

  update() {
    this.date = new Date();

    for (const dependent of this.dependents) {
      dependent.needsUpdate = true;
    }
  }
}
