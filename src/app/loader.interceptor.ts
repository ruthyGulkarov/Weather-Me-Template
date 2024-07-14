import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoaderService } from "./core/services/loader.service";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(private loaderService: LoaderService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loaderService.addRequest();

        return next.handle(req).pipe(
            tap((req) => {
                if (req instanceof HttpResponse) {
                    this.loaderService.removeRequest();
                }
            }, (error) => {
                this.loaderService.removeRequest();
            })
        );
    }
}