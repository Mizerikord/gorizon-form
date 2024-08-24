class Api {
    constructor({ baseUrl }) {
        this._addres = baseUrl;
        // this._headers = headers;
    }

    _getAnswer(res) {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка ${res.status}`);
    }

    getFilters() {
        return fetch(`${this._addres}/filters/get_custom_filter_data/SPB`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }
        }).then(res => {
            res.json();
        }).catch(err => {
            console.log(err.code)
        })
    }
    postUsersFiilter(filtersData){
        return fetch(`${this._addres}/filters/get_custom_filter_data/SPB`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtersData)
        }).then(res => {
            res.json();
        }).catch(err => {
            console.log(err.code);
        })
    }
}