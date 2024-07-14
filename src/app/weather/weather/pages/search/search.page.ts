import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { LocationService } from 'src/app/core/services/location.service';
import { WeatherService } from 'src/app/core/services/weather.service';
import { CurrentWeather } from 'src/app/shared/models/currentWeather.model';
import { Forecast } from 'src/app/shared/models/forecast.model';
import { Location } from 'src/app/shared/models/location.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {

  cityCtrl = new FormControl('');
  cityLocation: Location;
  filteredOptions: Observable<Location[]>;
  favoriteList: Location[];
  weather5Day: Forecast;
  currentWeather: CurrentWeather;
  currentWeatherTemperature: Number;
  weather5DayTemperature: { Date: string; Maximum: Number; Minimum: Number; }[];
  displayedColumns: string[] = ['Date', 'Maximum', 'Minimum'];
  cityInFav: boolean = false;

  constructor(private locationService: LocationService, private favoritesService: FavoritesService, private weatherService: WeatherService,
    private router: Router, private activatedRoute: ActivatedRoute) {

    this.setFavoriteList();
    this.activatedRoute.params.subscribe(params => {
      let locationKey = params?.locationKey;

      if (locationKey) {
        this.locationService.getLocationByKey(locationKey).subscribe(res => {
          this.cityLocation = res

          this.cityInFav = this.favoriteList.findIndex(x => x.Key == this.cityLocation.Key) != -1;
        });
        this.showWeather(locationKey);
      } else {
        this.locationService.getLocationByKey('215854').subscribe(res => {
          this.selectCity(res);
        });
      }
    });
  }

  ngOnInit() {
    this.cityCtrl.valueChanges.subscribe(value => {
      this.filteredOptions = this._filter(value || '')
    });
  }

  private _filter(value: string): Observable<Location[]> {
    if (!value) {
      return;
    }
    return this.locationService.getAutocompleteLocation(value)
      .pipe(
        map(response => {
          return response;
        }));
  }

  setFavoriteList() {
    this.favoriteList = this.favoritesService.getFavorites();
  }

  selectCity(city: Location) {
    if (city) {
      this.cityCtrl.setValue('');
      this.router.navigate(['search/', city.Key])
    }
  }

  addOrRemoveFav(city: Location) {
    if (this.cityInFav)
      this.removeFav(city);
    else
      this.addToFav(city);
  }

  addToFav(city: Location) {
    this.favoritesService.addToFavorites(city);
    this.cityInFav = true;
    this.setFavoriteList();
  }

  removeFav(option: Location, event?) {
    if (event) {
      event.stopPropagation();
    }
    this.favoritesService.removeFromFavorites(option.Key);
    this.cityInFav = false;
    this.setFavoriteList();
  }

  showWeather(key) {
    this.weatherService.getCurrentWeather(key).subscribe(res => {
      this.currentWeather = res[0];
      this.currentWeatherTemperature = this.currentWeather.Temperature.Metric.Value;
    });

    this.weatherService.getForecast(key).subscribe(res => {
      this.weather5Day = res;
      this.weather5DayTemperature = this.weather5Day.DailyForecasts.map(d => { return { Date: d.Date.split('T')[0], Maximum: d.Temperature.Maximum.Value, Minimum: d.Temperature.Minimum.Value } });
    });

  }
}