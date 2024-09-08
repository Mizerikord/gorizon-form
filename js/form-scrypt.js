const formElemIsOpen = document.querySelector(".add-search-nav");
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
const foundTemplate = document.querySelector("#found");
const buildPopupTemplate = document.querySelector("#build-popup-template");
const schemePopupTemplate = document.querySelector("#popup-scheme");
const addBtnTemplate = document.querySelector("#add-button");
const roomsArea = document.querySelectorAll(".input-counter");
let resultBtn = document.querySelectorAll(".filter-result-btn");

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

let isAddFilters = false;
let data = "";
let isAddCount = "";
let isFilteredData = [];
let backData = [];
let buildData = {};
let isShowInfo = [];
let resultFilters = "";
let idState = "";
let popupState = "";
let currentPopupState = "";
let stepsState = [];
let localState = document.querySelector(".location_checked");
const userData = {};
let isAdvancedSearchOpen = false;
let metaData = "";
let indexImg = 0;
let timerId = "";

//Определяем ширину окна браузера
let isWindowWidth = window.innerWidth;
isWindowWidth > 787 ? isAddCount = 10 : isAddCount = 5;
let isFilteredCount = "";
isFilteredCount = isFilteredCount + isAddCount;
window.addEventListener('resize', () => {
    isWindowWidth = window.innerWidth;
    isWindowWidth > 787 ? isAddCount = 10 : isAddCount = 5;
    isFilteredCount = isFilteredCount + isAddCount;
    return;
})

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
        return fetch(`${this._addres}/filters/get_buildings_data/SPB/${filtersData}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(out => out)
            .then(res => res.json())
            .catch(err => {
                console.log(err.code);
            })
    };

    getBuildInfo(id) {
        return fetch(`${this._addres}/blocks/spb/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(out => out)
            .then(res => res.json())
            .catch(err => {
                console.log(err.code);
            })
    }
}

//создание класса запросов к Api 
const api = new Api({ baseUrl: 'https://api.mk-estate.enterdevelopment.ru' });
getFilters();

//Получение данных фильтров
function getFilters() {
    document.querySelector(".preloader-container").classList.remove("preloader-container_disale");
    api.getFilters()
        .then(res => {
            data = res;
            btnAccess();
            document.querySelector(".preloader-container").classList.add("preloader-container_disale");
        })
        .catch(err => {
            console.log(err);
            document.querySelector(".preloader-container").classList.add("preloader-container_disale");
        })
}

//доступ к кнопкам при прогрузке
function btnAccess() {
    detailsBtn.forEach(elem => elem.classList.remove("drop-btn__name_disabled"));
    openDropBtn();
}

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
formElemIsOpen.addEventListener("click", () => { openForm() });

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
            if (correctBox.id === "pay" || correctBox.id === "city" || correctBox.id === "decorate") {
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
    if (option === "pay" || option === "city" || option === "decorate") {
        currentOption = defaultPosition[option].sort();
    } else {
        if (option === "price") {
            currentOption = arr;
            return;
        }
        option === "building_deadlines" ? currentOption = arr.reverse() : currentOption = arr.sort();
        currentOption = arr;
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
        selectedData.forEach(dataPrice => {
            if (dataPrice.value === "") {
                return;
            }
            userData[dataPrice.id] = [dataPrice.value];
        })
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
        if (newData.length == 0) {
            return;
        }
        userData[popupState] = [];
    }
    newData.forEach(elem => {
        if (userData[popupState].includes(elem)) {
            return;
        }
        userData[popupState].push(elem);
    })
    showEnters();
}

//обработчик сброса данных
function clearChecked(reset) {
    if (reset.parentElement.parentElement.classList.contains("price")) {
        document.querySelectorAll(".price-enter-input").forEach(elem => elem.value = "");
        return;
    }
    const resetElem = reset.parentNode.previousElementSibling.querySelectorAll(".select-price-radio:checked");
    resetElem.forEach((elem) => {
        elem.checked = false;
    })
}

//Добавление выбранной площади с формированием текста
roomsArea.forEach(elem => elem.oninput = (e) => {
    resetSavedList();
    saveArea.classList.add("selected-points_active");
    takeRoomsArea(e.target);
    showEnters();
})

//формирвоание текста с выбранной площадью
function createTextContent() {
    let dataText = userData["area_total_from"] || userData["area_total_to"]
        ? `Общая площадь ${userData["area_total_from"]
            ? "от: " + userData["area_total_from"] : ""} ${userData["area_total_to"]
                ? "до: " + userData["area_total_to"] : ""}` : "";
    dataText = dataText + (userData["area_kitchen_from"] || userData["area_kitchen_to"]
        ? ` Площадь кухни ${userData["area_kitchen_from"]
            ? "от: " + userData["area_kitchen_from"] : ""} ${userData["area_kitchen_to"]
                ? "до: " + userData["area_kitchen_to"] : ""}` : "");
    return dataText;
}

//Изъятие данных площади из инпутов
function takeRoomsArea(targetElement) {
    let allOut = [];
    roomsArea.forEach((elem) => {
        allOut.push(elem);
    })
    allOut = allOut.every(el => el.value === "");
    allOut ? resetSavedList() : "";


    if (targetElement.value === "" || targetElement.value === undefined) {
        delete userData[`${targetElement.id}`];
        showEnters();
        return;
    }
    userData[`${targetElement.id}`] = [targetElement.value];
    showEnters()
    return;
}

//Добавление данных к нижнему фильтру + общему сбросу
function showEnters() {
    let areaEl;
    if (Object.values(userData).length === 0) {
        return
    }
    resetSavedList();
    saveArea.classList.add("selected-points_active");
    let showData = [];
    showData = userData;
    const objKeys = Object.keys(userData);
    objKeys.forEach(keyEl => {
        switch (keyEl) {
            case "regions":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "subways":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "building_deadlines":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "rooms":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "area_total_from":
            case "area_total_to":
            case "area_kitchen_from":
            case "area_kitchen_to":
                document.querySelector('[data-id = "area"]') ? "" : areaEl = createAreaEl();
                let textFromEl = createTextContent();
                areaEl.textContent = textFromEl;
                if (formDropFilterOpen.classList.contains("drop-filter-open_add")) {
                    return;
                }
                formDropFilterOpen.classList.add("drop-filter-open_add");
                isAddFilters = true;
                return;
            case "price_from":
                let priceLi = document.querySelector(".price-li");
                if (priceLi === null) {
                    priceLi = document.createElement("li");
                    priceLi.classList.add("selected-item");
                    priceLi.classList.add("price-li");
                }
                const text = document.createTextNode(`От: ${showData[keyEl]} тыс.руб.`);
                priceLi.appendChild(text);
                priceLi.setAttribute("data-id", keyEl);
                removeSelf(priceLi, savedList);
                savedList.insertBefore(priceLi, savedList.firstChild);
                isAddFilters = true;
                return;
            case "price_to":
                let priceLiMax = document.querySelector(".price-li");
                if (priceLiMax === null) {
                    priceLiMax = document.createElement("li");
                    priceLiMax.classList.add("selected-item");
                    priceLiMax.classList.add("price-li");
                }
                const textMax = document.createTextNode(` До: ${showData[keyEl]} тыс.руб.`);
                priceLiMax.appendChild(textMax);
                priceLiMax.setAttribute("data-id", keyEl);
                removeSelfArea(priceLiMax, savedList);
                savedList.insertBefore(priceLiMax, savedList.firstChild);
                isAddFilters = true;
                return;
            case "building_types":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "finishings":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "blocks":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "builders":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "city":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "decorate":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
            case "pay":
                showData[keyEl].forEach(item => {
                    let newItem = createBottomElements(item, keyEl);
                    savedList.insertBefore(newItem, savedList.firstChild);
                    isAddFilters = true;
                })
                return;
        }
    })
    formDropFilterOpen.classList.add("drop-filter-open_add");
    clearCheckElements();
}

//создаем подстроку для фильтра площади
function createAreaEl() {
    const areaEl = document.createElement("li");
    areaEl.classList.add("selected-item");
    areaEl.setAttribute("data-id", "area");
    removeSelfArea(areaEl, savedList);
    savedList.insertBefore(areaEl, savedList.firstChild);
    return areaEl;
}

function createBottomElements(item, keyEl) {
    const li = document.createElement("li");
    li.classList.add("selected-item");
    const text = document.createTextNode(item);
    li.appendChild(text);
    li.setAttribute("data-id", keyEl);
    removeSelf(li, savedList);
    return li;
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
    item.addEventListener("click", (e) => {
        let newArr = userData[e.target.getAttribute("data-id")].filter(elem => elem !== e.target.textContent);
        userData[e.target.getAttribute("data-id")] = newArr;
        perent.removeChild(e.target);
        if (perent.firstChild.nodeName === "P") {
            saveArea.classList.remove("selected-points_active");
            formDropFilterOpen.classList.remove("drop-filter-open_add");
            return;
        }
    })
}

//Обработчик самоликвидации для цены и площади
function removeSelfArea(item, perent) {
    item.addEventListener("click", (e) => {
        delete userData[e.target.getAttribute("data-id")];
        perent.removeChild(e.target);
        if (e.target.getAttribute("data-id") === "area") {
            delete userData["area_kitchen_from"];
            delete userData["area_kitchen_to"];
            delete userData["area_total_from"];
            delete userData["area_total_to"];
            document.querySelectorAll(".input-counter").forEach(elem => elem.value = "");
        }
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

//список вариантов при введении в поле ввода символов
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
                if (userData.blocks) {
                    if (userData.blocks.includes(e.target.textContent)) {
                        return;
                    }
                }
                userData.blocks ? userData["blocks"].push(e.target.textContent) : userData["blocks"] = [];
                userData["blocks"].push(e.target.textContent);
                showEnters(userData.blocks);
                closePopup();
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
                showEnters(userData.builders);
            })
            searchResultList.appendChild(li);
        })
        return;
    }
    return;
}

//поиск без учета регистра
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
resultBtn.forEach(elem => {
    elem.addEventListener("click", () => {
        startResult();
    })
})

function startResult() {
    document.querySelector(".preloader-container").classList.remove("preloader-container_disale");
    let headerLine = `?count=${isFilteredCount}&`;
    let keysEl = Object.keys(userData);
    keysEl.forEach(elem => {
        headerLine = headerLine + `${elem}=`;
        userData[elem].length === 1 ? headerLine = headerLine + `${userData[elem]}&`
            : userData[elem].forEach(el => {
                headerLine = headerLine + `${el},`
            })
    }
    )
    headerLine = headerLine.slice(0, headerLine.length - 1);
    headerLine = headerLine.replace(/\s/g, "%20");

    if (document.querySelectorAll(".found-result")) {
        document.querySelectorAll(".found-result").forEach(elem => elem.remove());
    }
    document.querySelector(".found-add-btn") ? document.querySelector(".found-add-btn").classList.add("found-add-btn_disable") : "";

    api.getUsersFiilter(headerLine)
        .then((res) => {
            document.querySelector(".preloader-container").classList.add("preloader-container_disale");
            isFilteredData = res.data.map(elem => elem);
            backData = res.data.map(elem => elem);
            metaData = res.meta;
            isFilteredCount = res.meta.count;
            showResultData(res.meta);
        })
        .catch(err => {
            document.querySelector(".preloader-container").classList.add("preloader-container_disale");
            console.log(err)
        })

}
window.onload = startResult;

//Добавление кнопки подгрузки
function addResultsByWidth() {
    let allItem = document.querySelectorAll(".found-result");
    let lastItem = allItem[allItem.length - 1];
    let addBtn = addBtnTemplate.content.cloneNode(true);
    addBtn.querySelector(".found-add-btn").addEventListener("click", () => {
        isFilteredCount = isFilteredCount + isAddCount;
        startResult();
    });
    let parent = lastItem.parentElement;
    parent.appendChild(addBtn);
}

//Вывод данных из Api по фильтрам пользователя
function showResultData(meta) {
    const buildTemplate = buildPopupTemplate.content.cloneNode(true);
    document.getElementsByTagName("body")[0].parentElement.append(buildTemplate);
    document.querySelector(".calc-button").addEventListener("click", () => {
        mortgageCalculator();
    });
    let maxLength = meta["filtered_total"];
    document.querySelector(".found-add-btn") ? document.querySelector(".found-add-btn").parentElement.removeChild(document.querySelector(".found-add-btn")) : "";
    isShowInfo ? isShowInfo = isFilteredData.splice(isFilteredCount) : isFilteredData.splice(isFilteredCount);
    isFilteredData.forEach(elem => {
        const foundedContainer = foundTemplate.content.cloneNode(true);
        const imgContainer = foundedContainer.querySelector(".found-img");
        const foundedHeader = foundedContainer.querySelector(".found-builder-info-header");
        const foundedAddres = foundedContainer.querySelector(".found-builder-info-addres");
        const foundedAroundSabways = foundedContainer.querySelector(".found-builder-info-list");
        const foundedBuildInfo = foundedContainer.querySelector(".found-build-info");
        const foundedPeice = foundedContainer.querySelector(".found-price");
        imgContainer.setAttribute("src", elem["block.renderer"][0]);
        const foundLink = foundedContainer.querySelector(".found-link");
        foundLink.id = elem["block.block_id"];
        foundLink.addEventListener("click", (e) => {
            document.querySelector(".preloader-container").classList.remove("preloader-container_disale");
            api.getBuildInfo(e.target.id)
                .then(res => {
                    createNewPopup()
                    buildData = res;
                    document.querySelector(".popup-build").classList.add("popup-build_enable");
                    createBuildWindow(buildData);
                    document.querySelector(".preloader-container").classList.add("preloader-container_disale");
                })
                .catch(err => {
                    console.log(err);
                    document.querySelector(".preloader-container").classList.add("preloader-container_disale");
                })
        });
        foundedHeader.textContent = elem["block.name"];
        foundedAddres.textContent = elem["block.address"][0];
        elem["block.subway"].forEach(subway => {
            creatorSubwayBlock(foundedAroundSabways, subway);
        })
        creatorBuildInfoBlock(foundedBuildInfo, elem);
        creatorPriceBlock(foundedPeice, elem);
        document.querySelector(".form-container").append(foundedContainer);
    })
    isFilteredData = isShowInfo.map(elem => elem);
    (document.querySelectorAll(".found-result").length >= maxLength) ? "" : addResultsByWidth();
}

function createNewPopup() {
    const template = buildPopupTemplate.content.cloneNode(true);
    document.getElementsByTagName("body")[0].appendChild(template);
}

//Создание блока с данными метро рядом
function creatorSubwayBlock(block, subway) {
    let li = document.createElement("li")
    let p = document.createElement("p");
    li.classList.add("found-builder-info-item");
    p.classList.add("found-subway");
    p.textContent = subway["subway_name"];
    li.append(p);
    block.append(li);
}

//Создание блока с данными адреса рядом
function creatorBuildInfoBlock(block, contains) {
    block.querySelector(".build-info-data").
        textContent = contains["building_deadline_min"] === contains["building_deadline_max"] ? `${contains["building_deadline_min"]}` : `${contains["building_deadline_min"]} - ${contains["building_deadline_max"]}`;
    let finish = [];
    contains["finishing"].forEach(elem => finish.push(elem))
    block.querySelector(".build-info-finishing").
        textContent = `${finish}`;
}

//Создание блока с данными цен на квартиры
function creatorPriceBlock(block, price) {
    if (price === undefined) {
        return;
    }
    const priceParent = block.querySelector(".found-price-list");
    const roomsArea = price["rooms"].sort((user1, user2) => user1["room"] > user2["room"] ? 1 : -1);
    roomsArea.forEach(el => {
        let li = document.createElement("li");
        li.classList.add("found-price-item");
        let pInfo = document.createElement("p");
        pInfo.classList.add("found-price-description");
        let pCost = document.createElement("p");
        pCost.classList.add("found-price-info");
        pInfo.textContent = `${el.room} от:`;
        pCost.textContent = `${el.price}`;
        li.append(pInfo);
        li.append(pCost);
        priceParent.append(li);
    });
}

//Попап отдельного ЖК
function findByName(id) {
    return backData.find((obj) => obj["block.block_id"] === id);
}

function createBuildWindow(build) {
    //Заголовок
    //Заголовок
    document.querySelector(".build-title").textContent = build["block.name"];
    const subwayList = document.querySelector(".build-subways-list");
    //список метро рядом и доступность
    function findAroundSubways(subwayList) {
        build["block.subway"] ? build["block.subway"].forEach((elem) => {
            const li = document.createElement("li");
            const p = document.createElement("p");
            const pWay = document.createElement("p");
            li.classList.add("build-subways-item");
            p.classList.add("build-subways-elem");
            pWay.classList.add("build-way");
            pWay.textContent = `${elem["subway_name"]} `;
            elem["distance_type"] == 2 ? p.classList.add("build-way-train") : p.classList.add("build-way-run");
            p.textContent = `${elem["distance_time"]} мин.`;
            li.appendChild(pWay);
            li.appendChild(p);
            subwayList.appendChild(li);
        }) : "";
    }
    findAroundSubways(subwayList);

    //Промо
    //Промо
    //Поиск минималоьной стоимости
    let buildDeadline = [];
    Object.keys(build["rooms"]).forEach(elem => {
        buildDeadline.push(elem);
    })
    let roomDeadline = [];
    let minCost = [];
    let maxFloor = [];
    let finishName = [];
    let roomsName = [];
    buildDeadline.forEach(item => {
        Object.values(build["rooms"][item]).forEach(elem => {

            for (let el of Object.values(elem)) {
                minCost.push(el.price);
                maxFloor.push(el.floor);
                finishName.includes(el["finishing_name"]) ? "" : finishName.push(el["finishing_name"]);
                roomDeadline.includes(el["building_deadline"]) ? "" : roomDeadline.push(el["building_deadline"]);
                roomsName.includes(el["room_name"]) ? "" : roomsName.push(el["room_name"]);
            }
        });
    })
    minCost = Math.min(...minCost.flat());
    maxFloor = Math.max(...maxFloor.flat());
    document.querySelector(".promo-title").textContent = `Цена от ${minCost} руб.`
    document.querySelector(".promo-info-elem-deadline").
        textContent = `${roomDeadline}`;
    document.querySelector(".promo-info-elem-floor").textContent = `${maxFloor}`;
    document.querySelector(".promo-info-elem-finishung").textContent = build.finishing.flat().join(", ");
    const sliderList = document.querySelector(".slider-checkbox-list");
    build["block.renderer"].forEach(elem => {
        const inputLi = document.createElement("li");
        const inputEl = document.createElement("input");
        inputEl.type = "radio";
        inputEl.name = "slider-img";
        inputEl.classList.add("slider-input");
        inputEl.value = elem;
        inputEl.addEventListener("click", (e) => {
            clearInterval(timerId);
            document.querySelectorAll(`.slider-input`).forEach(elem => elem.disabled = true);
            document.querySelector(".build-img-item").classList.toggle("img-animation-slider");
            setTimeout(() => {
                document.querySelector(".build-img-item").style.backgroundImage = `url('${document.querySelector(`input[name="slider-img"]:checked`).value}')`;

            }, 1000)
            setTimeout(() => {
                document.querySelector(".build-img-item").classList.remove("img-animation-slider");
                document.querySelectorAll(`.slider-input`).forEach(elem => elem.disabled = false);
            }, 2000)
            setTimeout(() => {
                indexImg = -1;
                setInterval(startSlider, 6000);
            }, 30000)
        })
        inputLi.appendChild(inputEl);
        sliderList.appendChild(inputLi);
    });
    const allRadioImg = document.querySelectorAll(".slider-input");
    indexImg = 0;
    let timerId = setInterval(startSlider, 6000);
    function startSlider() {
        indexImg += 1;
        if (indexImg === allRadioImg.length) {
            indexImg = 0;
        }
        document.querySelectorAll(`.slider-input`)[indexImg].checked = true;
        document.querySelector(".build-img-item").classList.toggle("img-animation-slider");
        setTimeout(() => {
            document.querySelector(".build-img-item").style.backgroundImage = `url('${allRadioImg[indexImg].value}')`;
        }, 1000)
        setTimeout(() => {
            document.querySelector(".build-img-item").classList.remove("img-animation-slider");
        }, 2000)
        allRadioImg[indexImg].checked = true;
    }
    document.querySelector(".popup-disable").addEventListener("click", () => {
        document.querySelector(".popup-disable").style.display = "none";
        document.querySelector(".popup-build").parentNode.removeChild(document.querySelector(".popup-build"));
        clearInterval(timerId);
    });
    document.querySelector(`.slider-input`).checked = true;
    document.querySelector(".build-img-item").style.backgroundImage = `url('${document.querySelector(`input[name="slider-img"]:checked`).value}')`;
    //Описание
    //Описание
    document.querySelector(".description-title").textContent = `ПЛАНИРОВКИ И ЦЕНЫ ЖК ${build["block.name"]}`;
    //Выводим фильтр по комнатам и создаем форму
    const roomsForm = document.querySelector(".description-form-list");
    roomsName.sort();
    roomsName.unshift("Все");
    roomsName.forEach(elem => {
        const li = document.createElement("li");
        const input = document.createElement("input");
        input.classList.add("select-price-radio");
        input.classList.add("select-rooms");
        input.id = elem;
        input.type = "checkbox";
        input.name = elem;
        li.classList.add("description-form-item");
        input.value = elem;
        li.appendChild(input);
        li.innerHTML += `${elem}`;
        roomsForm.appendChild(li);
    })
    //Список квартир со всеми данными
    const roomsContainer = document.querySelector(".description-list");
    Object.keys(build.rooms).forEach(room => {
        const li = document.createElement("li");
        li.classList.add("description-item");
        const p = document.createElement("p");
        p.classList.add("description-build");
        p.innerHTML += `${room}`;
        li.appendChild(p);
        roomsContainer.appendChild(li);
        const roomsArea = Object.keys(build.rooms[room]).sort();
        const roomsUl = document.createElement("ul");
        roomsUl.classList.add("rooms-data-list");
        roomsArea.forEach(elem => {
            const details = document.createElement("details");
            details.classList.add("rooms-details");
            const summary = document.createElement("summary");
            summary.classList.add("rooms-summary");
            const roomsLi = document.createElement("li");
            roomsLi.classList.add("rooms-data-item");
            const pRoom = document.createElement("p");
            pRoom.classList.add("build-rooms-count");
            const pCost = document.createElement("p");
            const pArea = document.createElement("p");
            const pNumber = document.createElement("p");
            const isOpen = document.createElement("div");
            isOpen.classList.add("details-open-toggle");
            summary.addEventListener("click", (e) => {
                e.target.closest(".rooms-details").open !== true ? isOpen.classList.add("details-open-toggle_open") : isOpen.classList.remove("details-open-toggle_open")
            })
            const roomsData = Object.keys(build.rooms[room][elem]); const roomsList = document.createElement("ul");
            roomsList.classList.add("rooms-data-insert-list");
            roomsData.forEach(data => {
                const roomItem = document.createElement("li");
                roomItem.classList.add("rooms-data-insert-item");
                const corpusP = document.createElement("p");
                corpusP.classList.add("corpus-name");
                corpusP.textContent = build.rooms[room][elem][data]["building_name"];
                const floorP = document.createElement("p");
                floorP.textContent = `${build.rooms[room][elem][data]["floors"]}/${build.rooms[room][elem][data]["floors"]}`;

                const areaTotalP = document.createElement("p");
                areaTotalP.textContent = build.rooms[room][elem][data]["area_total"];
                const areaKitchenP = document.createElement("p");
                areaKitchenP.classList.add("kitchen-name-selector")
                areaKitchenP.textContent = build.rooms[room][elem][data]["area_kitchen"];
                const finishingP = document.createElement("p");
                finishingP.classList.add("finishing-name");
                finishingP.textContent = build.rooms[room][elem][data]["finishing_name"];
                const priceP = document.createElement("p");
                priceP.textContent = build.rooms[room][elem][data]["price"];
                const planP = document.createElement("p");
                planP.classList.add("rooms-scheme");
                //Открытие планировки
                planP.addEventListener("click", () => {
                    const schemePopup = schemePopupTemplate.content.cloneNode(true);
                    document.getElementsByTagName("body")[0].appendChild(schemePopup);
                    const planPopup = document.querySelector(".scheme-popup");
                    planPopup.querySelector(".plan-title").textContent = build["block.name"];
                    findAroundSubways(planPopup.querySelector(".plan-subways-list"));
                    planPopup.querySelector(".scheme-rooms").src = build.rooms[room][elem][data]["plan"];
                    planPopup.querySelector(".plan-subtitle").textContent = `${build.rooms[room][elem][data]["price"]} руб.`;
                    planPopup.querySelector(".plan-deadline").textContent = build.rooms[room][elem][data]["building_deadline"];
                    planPopup.querySelector(".plan-finishing").textContent = build.rooms[room][elem][data]["finishing_name"];
                    planPopup.querySelector(".plan-floor").textContent = build.rooms[room][elem][data]["floor"];
                    planPopup.querySelector(".plan-pay").textContent = `${build["building_mortgage"] ? "Ипотека " : ""} ${build["building_subsidy"] ? "Субсидия " : ""} ${build["building_voen_mortgage"] ? "Военная ипотека" : ""}`;
                    planPopup.querySelector(".plan-height-roof").textContent = build.rooms[room][elem][data]["height"];
                    planPopup.querySelector(".plan-room-numbers").textContent = build.rooms[room][elem][data]["room_name"];
                    planPopup.querySelector(".plan-area-total").textContent = build.rooms[room][elem][data]["area_total"];
                    planPopup.querySelector(".plan-area-kitchen").textContent = build.rooms[room][elem][data]["area_kitchen"];
                    const planDisable = document.querySelector(".plan-disable");
                    planDisable.style.display = "flex";
                    planPopup.classList.add("scheme-popup_active");
                    planDisable.addEventListener("click", () => {
                        document.getElementsByTagName("body")[0].removeChild(document.querySelector(".scheme-popup"));
                    });
                })
                isWindowWidth > 676 ? planP.textContent = "Посмотреть планировку" : planP.textContent = "Посмотреть";
                [corpusP, floorP, areaTotalP, areaKitchenP, finishingP, priceP, planP].forEach(elem => {
                    roomItem.appendChild(elem);
                })
                pRoom.textContent = build.rooms[room][elem][data]["room_name"];
                const minCost = Math.min(build.rooms[room][elem][data]["price"]);
                pCost.textContent = `СТОИМОСТЬ ОТ: ${minCost}`;
                pCost.classList.add("build-rooms-cost");
                const minArea = Math.min(build.rooms[room][elem][data]["area_total"]);
                pArea.textContent = `МЕТРАЖ ОТ: ${minArea}`;
                pArea.classList.add("build-rooms-area");
                // const totalNumber = build.rooms[room][elem][data]["area_total"];
                pNumber.textContent = `КВАРТИР В ПРОДАЖЕ: ${roomsData.length}`;
                pNumber.classList.add("build-rooms-number");
                [pRoom, pCost, pArea, pNumber, isOpen].forEach(elem => {
                    summary.appendChild(elem);
                })
                roomsList.appendChild(roomItem);
            })
            details.appendChild(summary);
            details.appendChild(capCreator());
            details.appendChild(roomsList);
            roomsLi.appendChild(details);
            roomsUl.appendChild(roomsLi);
            li.appendChild(roomsUl);
        });
        roomsContainer.appendChild(li);
    });
    //Описание
    document.querySelectorAll(".select-rooms")[0].checked = true;
    document.querySelector(".description-about-paragraph").innerHTML = build.description;
    document.querySelectorAll(".select-rooms").forEach(elem => {
        elem.addEventListener("click", (e) => {
            e.target.value === "Все" ?
                document.querySelectorAll(".select-rooms").forEach(elem => {
                    elem.value === "Все" ?
                        elem.checked = true : elem.checked = false;
                })
                : document.querySelectorAll(".select-rooms")[0].checked = false;

            let count = document.querySelectorAll(".build-rooms-count");
            count.forEach(item => {
                document.getElementById(`${item.textContent}`).checked ? item.closest(".rooms-data-item").style.display = "flex" : item.closest(".rooms-data-item").style.display = "none";
            });
            e.target.value === "Все" ? count.forEach(el => {
                el.closest(".rooms-data-item").style.display = "flex";
            })
                : "";
            e.target.value !== "Все" ? e.target.checked ? e.target.checked = true : e.target.checked = false : "";
            let passed = []
            document.querySelectorAll(".select-rooms").forEach(elem => elem.checked === true ? passed.push(elem) : "");
            passed.length === 0 ? document.querySelectorAll(".rooms-data-item").forEach(elem => {
                document.querySelectorAll(".select-rooms")[0].checked = true;
                elem.style.display = "flex"
            }) : "";
        })
    })
    document.querySelector(".popup-disable").style.display = "flex";
}

function mortgageCalculator() {
    const perent = document.querySelector("#calc-persent").value;
    const price = document.querySelector("#calc-price").value;
    const money = document.querySelector("#calc-money").value;
    const period = document.querySelector("#calc-period").value;
    let monthCost = price - money;
    monthCost = Math.round(((price - money) + perent / 100 * (price - money) * period) / (12 * period));
    document.querySelector(".result-price").textContent = `${monthCost} руб/мес.`

}

function capCreator() {
    const roomItem = document.createElement("li");
    roomItem.classList.add("rooms-data-insert-item-cap");
    const corpusP = document.createElement("p");
    corpusP.classList.add("corpus-name");
    const floorP = document.createElement("p");
    const areaTotalP = document.createElement("p");
    const areaKitchenP = document.createElement("p");
    areaKitchenP.classList.add("kitchen-name-selector")
    const finishingP = document.createElement("p");
    finishingP.classList.add("finishing-name");
    const priceP = document.createElement("p");
    const planP = document.createElement("p");
    corpusP.textContent = "Корпус";
    floorP.textContent = "Этаж";
    areaTotalP.textContent = "S общ.";
    areaKitchenP.textContent = "S кух.";
    finishingP.textContent = "Отделка";
    priceP.textContent = "Цена со %";
    planP.textContent = "";
    [corpusP, floorP, areaTotalP, areaKitchenP, finishingP, priceP, planP].forEach(elem => {
        roomItem.appendChild(elem);
    })
    return roomItem;
}