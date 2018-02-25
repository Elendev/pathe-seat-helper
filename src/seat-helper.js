/**
 */

(() => {

    /**
     * Download the seat map from the Pathe webservice, since we don't have access to the already downloaded seat map
     */

    let seatMap = null;

    const tooltipId = 'elendev-seat-helper-tooltip';
    const tooltipSeatId = 'elendev-seat-helper-tooltip-seat-id';
    const tooltipRowId = 'elendev-seat-helper-tooltip-row-id';

    getSeatMap(); //retrieve the seatMap on page load
    buildTooltip(); // build the DOM

    document.addEventListener('click', async event => {
        let element = event.target;

        if (element.classList.contains('a-seat')) {
            let seat = await getSeatFromDataId(element.dataset.id);

            document.getElementById(tooltipRowId).innerHTML = seat.row;
            document.getElementById(tooltipSeatId).innerHTML = seat.seat;
        }
    });

    document.addEventListener('mousemove', async event => {

        let element = document.elementFromPoint(event.x, event.y);

        if (typeof this.seat === 'undefined' || this.seat !== element) {
            this.seat = element;
            if (element.classList.contains('a-seat')) {
                try {
                    let seat = await getSeatFromDataId(element.dataset.id);

                    displaySeatNumber(seat.row, seat.seat, this.seat);
                } catch (error) {
                    hideTooltip();
                    console.error(error);
                }

            }
        } else if (!element.classList.contains('a-seat')) {
            hideTooltip();
        }


    });


    /**
     * Download and return the seat map
     * @returns {Promise<Map<Number, Object>>}
     */
    async function getSeatMap() {


        if (seatMap === null) {

            let cinemaAndSession = getCinemaAndSession();

            let response = await fetch('https://pathe.ch/vistafr/wsvistawebclient/restdata.svc/cinemas/' + cinemaAndSession.cinema + '/Sessions/' + cinemaAndSession.session + '/seat-plan');

            if (response.ok) {
                let jsonResponse = await response.json();

                seatMap = new Map();

                for (let area of jsonResponse.SeatLayoutData.Areas) {
                    for (let row of area.Rows) {
                        if (row.Seats.length > 0) {

                            for (let seat of row.Seats) {

                                if (!seatMap.has(seat.Position.RowIndex)){
                                    seatMap.set(seat.Position.RowIndex, {
                                        name: row.PhysicalName,
                                        seats: new Map()
                                    });
                                }

                                seatMap.get(seat.Position.RowIndex).seats.set(seat.Position.ColumnIndex, {
                                    name: seat.Id
                                })
                            }
                        }
                    }
                }
            }

        }

        return seatMap;
    }


    /**
     * @typedef {Object} CinemaAndSession
     * @property {String} cinema The cinema code
     * @property {String} session The session code
     */

    /**
     * Return the cinema and the session based on the location.hash
     *
     * @return {CinemaAndSession}
     */
    function getCinemaAndSession() {
        let hashRegex = /^#\/([A-Z]+)\/[A-Z]+([0-9]+)$/;

        let result = hashRegex.exec(location.hash);

        return {
            cinema: result[1],
            session: result[2],
        };
    }


    /**
     * @typedef {Object} CinemaSeat
     * @property {String} row The row name
     * @property {String} seat the seat number
     */
    /**
     * Return the seat and the row from the given data-id
     * @param id
     * @return CinemaSeat
     * @throw error not seat not found
     */
    async function getSeatFromDataId(id) {

        let dataIdRegex = /^[0-9]+-([0-9]+)-([0-9]+)-[0-9]+$/

        let result = dataIdRegex.exec(id);

        if (!result || result.length < 3) {
            throw 'ID ' + id + ' not recognized as data-id';
        }

        let seatMap = await getSeatMap();

        if (seatMap.has(parseInt(result[1]))) {
            let row = seatMap.get(parseInt(result[1]));

            if (row.seats.has(parseInt(result[2]))) {
                return {
                    row: row.name,
                    seat: row.seats.get(parseInt(result[2])).name
                }
            } else {
                throw 'Seat ' + result[2] + ' not found in the row ' + row.name + ' (' + result[1] + ')';
            }
        } else {
            throw 'Row ' + result[1] + ' not found in the seat map';
        }
    }

    /**
     * Create the tooltip and add it to the DOM
     */
    function buildTooltip() {
        let tooltip = document.createElement('div');
        tooltip.id = tooltipId;
        tooltip.classList.add('elendev-seat-helper-tooltip');

        let rowElement = document.createElement('span');
        rowElement.id = tooltipRowId;
        rowElement.classList.add('elendev-seat-helper-tooltip__row');

        let seatElement = document.createElement('span');
        seatElement.id = tooltipSeatId;
        seatElement.classList.add('elendev-seat-helper-tooltip__seat');

        tooltip.appendChild(rowElement);
        tooltip.appendChild(seatElement);

        document.body.appendChild(tooltip);
    }

    /**
     * Display the tooltip at the given coordinates with the given row and seat
     * @param row
     * @param seat
     * @param element element to display the seat number on
     */
    function displaySeatNumber(row, seat, element) {
        let tooltip = document.getElementById(tooltipId);

        document.getElementById(tooltipRowId).innerHTML = row;
        document.getElementById(tooltipSeatId).innerHTML = seat;

        let boundingClientRect = this.seat.getBoundingClientRect();

        tooltip.style.left = window.pageXOffset + boundingClientRect.x + 'px';
        tooltip.style.top = window.pageYOffset + boundingClientRect.y + 'px';

        tooltip.style.height = element.offsetHeight + 'px';
        tooltip.style.width = element.offsetWidth + 'px';

        tooltip.classList.add('visible');
        tooltip.classList.remove('hidden');

    }

    /**
     * Hide the tooltip
     */
    function hideTooltip() {
        let tooltip = document.getElementById(tooltipId);

        tooltip.classList.add('hidden');
        tooltip.classList.remove('visible');
    }

})();





