import のーど from '../../node';

export default class Nop extends のーど {
	numberOfInputs = 1;

	update() {
		this.state = this.inputs[0].state;
	}
}
