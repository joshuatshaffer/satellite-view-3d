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

- [x] Zoom in/out.
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
