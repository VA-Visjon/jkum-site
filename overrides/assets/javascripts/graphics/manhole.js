
class Manhole {
    constructor(manholeData) {
		this.manhole = manholeData;
	}

	dispose() {
		this.normalTarget.dispose();
		this.fsQuad.dispose();
	}
}