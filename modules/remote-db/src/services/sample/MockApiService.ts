import TYPES from "../../config/types";
import { inject } from "../../core/di";

import { TScopedService } from '../sample/ScopedService';

export class MockApiService {

    readonly scopedService = inject<TScopedService>(TYPES.scopedService);

    fetchDataSample = () => {
        console.log("Mocking request to example api...");
        return {
            'Authentication': `Bearer ${this.scopedService.getJwt()}`,
        }
    }

}

export default MockApiService;
