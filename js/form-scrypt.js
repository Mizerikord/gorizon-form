const formElemOpen = document.querySelector(".add-search-nav");
const formMapElem = document.querySelector(".search-map");
const formAdvancedSearchNav = document.querySelector(".advanced-search-nav");
const formCheckBox = document.querySelector(".search-checkbox-add");
const formDescriptionEl = document.querySelector(".description-hover");
const formDropFilter = document.querySelector("#drop-close");
const formDropFilterOpen = document.querySelector("#drop-open");
const formFilterBarBottom = document.querySelector(".filter-bar-bottom");
const filterResultBtnOpen = document.querySelector("#result-btn-add");
const filterResultBtn = document.querySelector("#result-btn");
const formPrev = document.querySelector(".mobile-prev");
const formPrevBack = document.querySelector(".filter-back");
const formOpen = document.querySelector(".filter-bar");
const detailsBtn = document.querySelectorAll(".drop-btn__name");
const templatePrice = document.querySelector("#priceradio");
const popup = document.querySelector(".popup");
const saveArea = document.querySelector(".selected-points");
const savedList = document.querySelector(".selected-list");
const savedListClener = document.querySelectorAll(".selected-clear");
const searchArea = document.querySelector(".search-input");
const searchResultList = document.querySelector(".inputs-results-list");
let resultBtn = document.querySelector(".filter-result-btn");
let isAddFilters = false;
const defaultPosition = {
    "city": [
        "Ленинградская область",
        "Санкт-петербург"
    ],
    "decorate": [
        "Без отделки",
        "Без стен",
        "Подчистова",
        "С мебелью",
        "Чистовая",
    ],
    "pay": [
        "Военная ипотека",
        "Ипотека",
        "Субсидии"
    ]
}

let data = "";
let resultFilters = "";
let idState = "";
let popupState = "";
let currentPopupState = "";
let stepsState = [];
let localState = document.querySelector(".location_checked");
const userData = {};
userData.blocks = [];
userData.builders = [];
let isAdvancedSearchOpen = false;

class Api {
    constructor({ baseUrl }) {
        this._addres = baseUrl;
    };

    getFilters() {
        return fetch(`https://api.mk-estate.enterdevelopment.ru/filters/get_custom_filter_data/SPB/`, {
            method: 'GET'
        }
        )
            .then(out => out)
            .then(res => res.json())

            .catch(err => {
                console.log(err.code)
            })
    };

    getUsersFiilter(filtersData) {
        console.log(filtersData);

        return fetch(`${this._addres}/filters/get_buildings_data/SPB/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtersData)
        })
            .then(out => out)
            .then(res => {
                res.json();
            }).catch(err => {
                console.log(err.code);
            })
    };
}

//создание класса запросов к Api 
const api = new Api({ baseUrl: 'https://api.mk-estate.enterdevelopment.ru' });
getFilters();

//Получение данных фильтров
function getFilters() {
    api.getFilters()
        .then(res => {
            data = res;
            btnAccess();
        })
        .catch(err => console.log(err))
}

//доступ к кнопкам при прогрузке
function btnAccess() {
    detailsBtn.forEach(elem => elem.classList.remove("drop-btn__name_disabled"));
    openDropBtn();
}
// drop-btn__name_disabled

//Закрытие попапа при клике вне
document.addEventListener("click", (e) => {
    if (!e.target.closest(".popup-enable") && !e.target.classList.contains("drop-btn__name")) {
        closePopup();
    }
    if (!e.target.closest(".inputs-results-list") && document.querySelector(".inputs-results-list").style.display === "flex") {
        closePopup();
    }
});

//Закрываем доп секцию
document.querySelector(".filter-bar-bottom").style.display = "none";

//Вешаем обработчики на внешние элементы
formElemOpen.addEventListener("click", () => { openForm() });

//Раскрытие фильтра
formPrev.addEventListener("click", () => {
    formOpen.classList.toggle("filter-bar_open");
})
//кнопка "Назад"
formPrevBack.addEventListener("click", () => {
    formOpen.classList.remove("filter-bar_open");
})

//Вешаем обработчики на раскрытие попапа при клике на окна
function openDropBtn() {
    detailsBtn.forEach((reg) => {
        reg.addEventListener("click", (e) => {
            idState = reg.parentElement.id;
            const correctBox = e.target.parentNode;
            const currentPopupTemplate = document.querySelector(`.${correctBox.id}`);
            if (popupState === correctBox.id) {
                closePopup();
                return;
            }
            if (popupState !== correctBox.id && popupState !== "") {
                closePopup();
            }
            const selectedPopup = currentPopupTemplate.content.cloneNode(true);
            correctBox.append(selectedPopup);
            currentPopupState = correctBox.querySelector(".popup");
            currentPopupState.classList.add("popup-enable");
            currentPopupState.classList.add(`${correctBox.id}`);
            if (reg.parentElement.id === "regions") {
                addEventToRegBtn();
            }
            //вешаем обработчик подтверждения
            const element = currentPopupState.querySelector(".confirm")
            element.addEventListener("click", () => {
                addConfirm(element, correctBox.id);
                closePopup();
            });

            //Поиск в районах и метро
            if (idState === "regions") {
                currentPopupState.querySelector(".search-location").addEventListener("keyup", (e) => {
                    const inputValue = e.target.value;
                    const newList = [];
                    data[idState].forEach((elem) => {
                        searchFromElement(elem, inputValue, newList)
                    });
                    showRegions(newList, correctBox.id);
                })
            }

            //вешаем сброс
            if (correctBox.id === "pay" || "city" || "decorate") {
            } else {
                currentPopupState.querySelector(".reset").addEventListener("click", () => {
                    clearChecked(currentPopupState.querySelector(".reset"))
                });
            }
            popupState = correctBox.id;
            showRegions(data[correctBox.id], correctBox.id);
            return;
        })
    })
}


//Вешаем обработчики на выбор локаций
function addEventToRegBtn() {
    const locationButtons = document.querySelectorAll(".location");
    locationButtons.forEach((local) => {
        local.addEventListener("click", (e) => {
            if (local.classList.contains("location_checked")) {
                return;
            }
            locationButtons.forEach(elem => elem.classList.remove("location_checked"));
            local.classList.add("location_checked");
            idState = e.target.getAttribute("data-set");
            localState = document.querySelector(".location_checked");
            showRegions(data[e.target.getAttribute("data-set")], e.target.getAttribute("data-set"));
        })
    })
}

//снимаем обработчики на выбор локаций
function removeEventToRegBtn() {
    const locationButtons = document.querySelectorAll(".location");
    locationButtons.forEach((local) => {
        local.removeEventListener("click", (e) => {
            if (local.classList.contains("location_checked")) {
                return;
            }
            locationButtons.forEach(elem => elem.classList.remove("location_checked"));
            local.classList.add("location_checked");
            idState = e.target.getAttribute("data-set");
            localState = document.querySelector(".location_checked");
            showRegions(data[e.target.getAttribute("data-set")], e.target.getAttribute("data-set"));
        })
    })
}
//Разворачиваем доп секцию
function openForm() {
    replaceElem();
    if (formFilterBarBottom.style.display === "none") {
        formFilterBarBottom.style.display = "grid";
        return;
    }
    formFilterBarBottom.style.display = "none";
    return;
}

//Перенос кнопки --Показать-- со всеми изменениями формы
function replaceElem() {
    isAdvancedSearchOpen = !isAdvancedSearchOpen;
    formCheckBox.classList.toggle("search-checkbox-add_active");
    formAdvancedSearchNav.classList.toggle("advanced-search-nav_add");
    formDropFilter.classList.toggle("drop-filter_add");
    filterResultBtn.classList.toggle("filter-result-btn_close");
    formFilterBarBottom.classList.toggle("filter-bar-bottom_open");
    filterResultBtnOpen.classList.toggle("filter-result-btn_open");
    formDropFilterOpen.classList.toggle("drop-filter-open");
}

//закрываем попап с очисткой состояний
function closePopup() {
    document.querySelector(".inputs-results-list").style.display = "none";
    removeEventToRegBtn();
    if (currentPopupState === "") {
        return;
    }
    if (popupState === "pay" || "city" || "decorate") {
    } else {
        clearChecked(currentPopupState.querySelector(".reset"));
        currentPopupState.querySelector(".reset").removeEventListener("click", () => { addConfirm(clearChecked(currentPopupState.querySelector(".reset"))) });
    }
    currentPopupState.classList.remove("popup-enable");
    currentPopupState.classList.remove(`${popupState}`);
    popupState = "";
    currentPopupState = "";
    stepsState = [];
    idState = "";
}

//создание списка ценового диапазона
function createElement(item, name, elem, pos) {
    item.querySelector(".select-price-radio").id = pos;
    item.querySelector(".select-price-radio").name = name;
    item.querySelector(".radio-text").htmlFor = pos;
    item.querySelector(".radio-text").innerText = elem;
}

//Загрузка данных из api
function showRegions(arr, option) {
    const selectList = currentPopupState.querySelector(".select-list");
    currentPopupState.querySelectorAll(".radio-elem").forEach(el => selectList.removeChild(el));
    let currentOption = "";
    if (option === "price") {
        currentOption = [`${arr["prices_min"]}`, `${arr["prices_max"]}`];
        return;
    }
    if ((data[option] === undefined) && (option === "pay" || "city" || "decorate")) {
        console.log(data[option], option);

        currentOption = defaultPosition[option].sort();
    } else {
        currentOption = arr.sort();
    }
    currentOption.forEach((elem) => {
        const item = templatePrice.content.cloneNode(true);
        item.querySelector(".select-price-radio").type = "checkbox";
        item.querySelector(".select-price-radio").id = elem;
        item.querySelector(".select-price-radio").name = option;
        item.querySelector(".radio-text").htmlFor = elem;
        item.querySelector(".radio-text").innerText = elem;
        selectList.append(item);
    })
}

//Вешаем обработчик на подтверждение данных
function addConfirm(btn, elemId) {
    if (elemId === "price") {
        const selectedData = btn.closest(".popup").querySelectorAll(".price-enter-input");
        if (selectedData[0].value === undefined || selectedData[1].value === undefined) {
            return;
        }
        userData["prices_min"] = selectedData[0].value;
        userData["prices_max"] = selectedData[1].value;
        showEnters();
        return;
    }
    const selectedData = btn.closest(".popup").querySelectorAll(".select-price-radio");
    let newData = [];
    selectedData.forEach((elem) => {
        if (elem.checked) {
            newData.push(elem.id);
        }
    });
    if (userData[popupState] === undefined) {
        userData[popupState] = newData;
    } else {
        newData.forEach(elem => {
            if (userData[popupState].includes(elem)) {
                return;
            }
            userData[popupState].push(elem);
        })
    }
    showEnters();
}

//обработчик сброса данных
function clearChecked(reset) {
    const resetElem = reset.parentNode.previousElementSibling.querySelectorAll(".select-price-radio:checked");
    resetElem.forEach((elem) => {
        elem.checked = false;
    })
}

//Добавление данных к нижнему фильтру + общему сбросу
function showEnters() {
    resetSavedList();
    saveArea.classList.add("selected-points_active");
    let showData = [];
    showData = Object.values(userData).flat().sort().reverse();
    showData.forEach(elem => {
        const li = document.createElement("li");
        li.classList.add("selected-item");
        const text = document.createTextNode(elem);
        li.appendChild(text);
        li.setAttribute("data-id", idState)
        savedList.insertBefore(li, savedList.firstChild);
        removeSelf(li, savedList)
        isAddFilters = true;
    });
    formDropFilterOpen.classList.add("drop-filter-open_add");
    clearCheckElements();
}

//общий сброс
savedListClener.forEach(elem => elem.addEventListener("click", () => {
    deleteSelectedElements();
    resetSavedList();
}));

//очистка выборки
function deleteSelectedElements() {
    for (let elem in userData) delete userData[elem];
}

function resetSavedList() {
    isAddFilters = false;
    while (savedList.firstChild) {
        if (savedList.firstChild.nodeName === "P") {
            saveArea.classList.remove("selected-points_active");
            formDropFilterOpen.classList.remove("drop-filter-open_add");
            clearCheckElements();
            return;
        }
        savedList.removeChild(savedList.firstChild);
    };
}

//Сброс состояний радио-кнопок
function clearCheckElements() {
    document.querySelectorAll(".select-price-radio").forEach(elem => elem.checked = false);
}

//Вешаем удаление из списка единичному элементу при клике на него
function removeSelf(item, perent) {
    item.addEventListener("click", () => {
        let newArr = userData[item.getAttribute("data-id")].filter(elem => elem !== item.textContent);
        userData[item.getAttribute("data-id")] = newArr;
        perent.removeChild(item);
        if (perent.firstChild.nodeName === "P") {
            saveArea.classList.remove("selected-points_active");
            formDropFilterOpen.classList.remove("drop-filter-open_add");
            return;
        }
    })
}

//Поиск но названию
searchArea.addEventListener("keyup", (e) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
        clearInputArea()
        closePopup();
        return;
    };
    document.querySelector(".inputs-results-list").style.display = "flex";
    const filter = {
        blocksName: "ЖК",
        blocksElem: [],
        buildersName: "Застройщик",
        buildersElem: []
    };
    data.blocks.forEach((elem) => {
        searchFromElement(elem, e.target.value.toLowerCase(), filter.blocksElem)
    });
    data.builders.forEach((elem) => {
        searchFromElement(elem, e.target.value.toLowerCase(), filter.buildersElem)
    });
    if (inputValue !== "") {
        addResultLine(filter);
        return;
    };
    clearInputArea();
    return;
})


//очистка поля ввода
function clearInputArea() {
    searchResultList.querySelectorAll(".input-result-item").forEach(elem => searchResultList.removeChild(elem));
    searchResultList.querySelectorAll(".input-result-item-name").forEach(elem => searchResultList.removeChild(elem));
    return;
}

//списко вариантов при введении в поле ввода символов
function addResultLine(list) {
    clearInputArea();
    if (list.blocksElem.length !== 0) {
        let liblocksName = document.createElement("li");
        liblocksName.classList.add("input-result-item-name");
        liblocksName.innerText = list.blocksName;
        searchResultList.appendChild(liblocksName);
        list.blocksElem.forEach(item => {
            let li = document.createElement("li");
            li.classList.add("input-result-item");
            li.innerText = item;
            li.addEventListener("click", (e) => {
                if (userData.blocks.includes(e.target.textContent)) {
                    return;
                }
                userData.blocks.push(e.target.textContent);
                closePopup();
                showEnters();
            })
            searchResultList.appendChild(li);
        })
    }

    if (list.buildersElem.length !== 0) {
        let buildersElem = document.createElement("li");
        buildersElem.classList.add("input-result-item-name");
        buildersElem.innerText = list.buildersName;
        searchResultList.appendChild(buildersElem);
        list.buildersElem.forEach(item => {
            let li = document.createElement("li");
            li.classList.add("input-result-item");
            li.innerText = item;
            li.addEventListener("click", (e) => {
                if (userData.builders.includes(e.target.textContent)) {
                    return;
                }
                userData.builders.push(e.target.textContent);
                closePopup();
                showEnters();
            })
            searchResultList.appendChild(li);
        })
        return;
    }
    return;
}

function searchFromElement(elem, isNeed, filter) {
    let current = isNeed.toLowerCase();
    let isElem = elem.toLowerCase();
    if (isElem.indexOf(current) > -1) {
        filter.push(elem);
        return;
    }
    return;
}

//Отправка итоговых данных
resultBtn.addEventListener("click", () => {
    api.getUsersFiilter(userData)
        .then(res => {
            console.log(res);
            data = res;

        })
        .catch(err => console.log(err))
})

//Установка кнопки итоговой фильтрации
window.addEventListener('resize', (e) => {
    const width = document.body.clientWidth;
    if (width < 768) {
        resultBtn = document.querySelectorAll(".filter-result-btn-slim");
    }
    resultBtn = document.querySelectorAll(".filter-result-btn-wide");
});

