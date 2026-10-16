import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', () => ({
	async create(ctx) {
		const body = ctx.request.body as { data?: unknown };
		if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
			const input = body.data as Record<string, unknown>;
			if ('status' in input) {
				input.orderStatus = input.status;
				delete input.status;
			}
		}

		const response = await super.create(ctx);
		if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
			const output = response.data as Record<string, unknown>;
			if ('orderStatus' in output) {
				output.status = output.orderStatus;
				delete output.orderStatus;
			}
		}
		return response;
	},
}));