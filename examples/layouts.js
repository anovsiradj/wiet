import { wiet, mixin } from '../wiet.js';

wiet('page-footer', class extends mixin() {
	constructor() {
		super();
		this.template = 'examples/footer.html';
	}
});
