class Api {
    constructor({baseUrl, headers}) {
        this._addres = baseUrl;
        this._headers = headers;
    }

    _getAnswer(res) {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка ${res.status}`);
    }

    getRegions() {
        const user = fetch(`${this._addres}/filters/get_custom_filter_data/SPB`, {
            method: 'GET',
            headers: {
                authorization: this._headers.authorization
            }
        })
        return user.then(this._getAnswer)
    }

    getInitialCards() {
        const cards = fetch(`${this._addres}/cards`, {
            method: 'GET',
            headers: this._headers
        })
        return cards.then(this._getAnswer)
    }

    patchProfile(profileData) {
        return fetch(`${this._addres}/users/me`, {
            method: 'PATCH',
            headers: this._headers,
            body: JSON.stringify({ name: profileData.name, about: profileData.about }),
        }).then(this._getAnswer)
    }

    postNewCard(newCardData) {
        return fetch(`${this._addres}/cards`, {
            method: 'POST',
            headers: this._headers,
            body: JSON.stringify({
                name: newCardData.name,
                link: newCardData.link
            })
        }).then(this._getAnswer)
    }

    deleteMyCard(card) {
        return fetch(`${this._addres}/cards/${card._id}`, {
            method: 'DELETE',
            headers: this._headers.authorization
        }).then(this._getAnswer)
    }

    makeLikeCard(card) {
        return fetch(`${this._addres}/cards/${card._id}/likes`, {
            method: 'PUT',
            headers: this._headers.authorization
        }).then(this._getAnswer)
    }

    deleteLikeCard(card) {
        return fetch(`${this._addres}/cards/${card._id}/likes`, {
            method: 'DELETE',
            headers: this._headers.authorization
        }).then(this._getAnswer)
    }

    patchAvatarUser(avatar) {
        return fetch(`${this._addres}/users/me/avatar`, {
            method: 'PATCH',
            headers: this._headers,
            body: JSON.stringify({ avatar }),
        }).then(this._getAnswer)
    }
}
const api = new Api({
    baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-61',
    headers: {
        authorization: '91b42385-e6f0-450f-ba44-00fb0fcb8aac',
        'Content-Type': 'application/json'
    }

});
export default api