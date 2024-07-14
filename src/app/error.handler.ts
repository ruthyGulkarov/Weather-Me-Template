import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Inject, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(@Inject(ErrorHandler) private defaultErrorHandler: ErrorHandler) { }

    handleError(error: any): void {
        if (error instanceof HttpErrorResponse) {

            window.alert(`Error: ${error.message}`)

            this.defaultErrorHandler.handleError(error);
        }
    }
}