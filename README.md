## Comparisons and Similar Software

- [OrbTrack](https://www.orbtrack.org/)
- [Rouge Space](https://sky.rogue.space/)
- [In-The-Sky.org](https://in-the-sky.org/skymap.php)
- [The Sky Live](https://theskylive.com/)
- [KeepTrack](https://www.keeptrack.space/)
- [Heavens-Above](https://www.heavens-above.com/)
- [N2YO.com](https://www.n2yo.com/)
- [Stellarium](http://stellarium.org/)
  - Also uses device orientation to show a view of the sky.
  - Focused on astronomy, but can show satellites.
- [AstroHopper](https://github.com/artyom-beilis/skyhopper)
  - Also uses device orientation to show a view of the sky.
  - Uses known stars to calibrate the device orientation.
  - Does not show satellites.

## To Do

- [x] Move control panel to the right side.
- [x] Stop labels from scrolling when the control panel scrolls.
- [x] Zoom in/out.
- [ ] Make this an installable PWA with offline support.
  - [ ] Offline support for viewing satellites using locally saved data.
- [ ] Show status of geolocation.
- [ ] Show status of device orientation.
- [ ] Try to make device orientation work in iOS.
- [ ] Search for satellites.
  - [ ] by name
  - [ ] by NORAD ID
  - [ ] by frequency
  - [ ] by radio mode
- [ ] Select/filter satellites display.
- [ ] Select a small number of satellites to "focus".
  - Focused satellites have
    - [x] a label,
    - [ ] a path trace,
    - [x] and a direction pointer when not in view.
- [x] Select a satellite from the sky view.
- [x] Drag to pan.
- [x] Scroll or pinch to zoom.
- [x] Show satellite details.
- [ ] Show satellite path.
- [ ] Show satellite passes.
- [x] Auto update satellite TLEs.
- [x] Cache satellite TLEs on client to improve performance.
- [ ] Cache satellite TLEs on server to reduce load on CelesTrak.
- [ ] Manual TLE input.
- [ ] Get transponder frequencies.
- [ ] Show doppler shift.
- [x] Link to other satellite tracking sites.

### Search UI

- [ ] The search UI overlays on the sky view.
- [ ] The active search filters which satellites are displayed in the sky view.
- [ ] The active search is not cleared when closing/minimizing the search UI.
- [ ] Searches can be saved.
- [ ] Searches can be assigned a color. Satellites matching a search will be highlighted in the sky view with the search's color.
- [ ] Remember recently used searches.
- [ ] Selecting a satellite from the search results list focusses it in the sky view.

## Special Thanks

Thank you [Saveitforparts](https://www.youtube.com/@saveitforparts) and [dereksgc](https://www.youtube.com/@dereksgc) for inspiring me to get back into amateur radio and satellite tracking.

Thank you [CelesTrak](https://www.celestrak.com/) for providing TLE data and documentation.
