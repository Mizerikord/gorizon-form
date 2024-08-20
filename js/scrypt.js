import data from "../js/utils/data.js";

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
const location = document.querySelectorAll(".location");
const templatePrice = document.querySelector("#priceradio");
const popup = document.querySelector(".popup");
const saveArea = document.querySelector(".selected-points");
const savedList = document.querySelector(".selected-list");
const savedListClener = document.querySelectorAll(".selected-clear");

let popupState = "";
let currentPopupState = "";
let stepsState = [];
let localState = document.querySelector(".location_checked");
const userData = {};
let isAdvancedSearchOpen = false;
let isAddFilters = false;

//раскрытие списка фильтров

//Закрытие при клике мимо попапа
document.addEventListener("click", (e) => {
    if (!e.target.closest(".popup-enable") && !e.target.classList.contains("drop-btn__name")) {
        closePopup();
        return;
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
detailsBtn.forEach((reg) => {
    reg.addEventListener("click", (e) => {
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
        //вешаем обработчик подтверждения
        currentPopupState.querySelector(".confirm").addEventListener("click", () => {
            addConfirm(currentPopupState.querySelector(".confirm"), correctBox.id);
            showEnters();
        });
        //вешаем сброс
        if (correctBox.id === "pay" || "city" || "decorate") {
            console.log("non-reset");
        } else {
            currentPopupState.querySelector(".reset").addEventListener("click", () => { clearChecked(currentPopupState.querySelector(".reset")) });
        }
        if (correctBox.id === "price") {
            createMathPrice(data);
        } else {
            showRegions(correctBox.id);
        }
        popupState = correctBox.id;
        return;
    })
})

//Вешаем обработчики на выбор локаций
location.forEach((local) => {
    local.addEventListener("click", (e) => {
        if (local.classList.contains("location_checked")) {
            return;
        }
        local.classList.add("location_checked");
        localState.classList.remove("location_checked");
        localState = document.querySelector(".location_checked");
        switch (localState.value) {
            case "Районы":
                showRegions("regions");
                popupState = "regions";
                break;
            case "Метро":
                showRegions("subways");
                popupState = "subways";
                break;
            case "Локации":
                showRegions("locations");
                popupState = "locations";
                break;
        }
    })
})

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
    if (currentPopupState === "") {
        return;
    }
    if (popupState === "pay" || "city" || "decorate") {
        console.log("non-reset");
    } else {
        clearChecked(currentPopupState.querySelector(".reset")); 
        currentPopupState.querySelector(".reset").removeEventListener("click", () => { addConfirm(clearChecked(currentPopupState.querySelector(".reset"))) });
    }
    currentPopupState.querySelector(".confirm").removeEventListener("click", () => { addConfirm(addConfirm(currentPopupState.querySelector(".confirm"))) });

    currentPopupState.classList.remove("popup-enable");
    currentPopupState.classList.remove(`${popupState}`);
    popupState = "";
    currentPopupState = "";
    stepsState = [];
}

//Создание диапазона цен
function createMathPrice(data) {
    const selectList = currentPopupState.querySelectorAll(".select-list");
    const minPrice = Math.floor(data.prices_min / 100000) * 100000;
    const maxPrice = Math.ceil(data.prices_max / 100000) * 100000;
    const selectListStart = currentPopupState.querySelector(".select-list_start");
    const selectListStop = currentPopupState.querySelector(".select-list_stop");
    for (let i = minPrice; i < maxPrice; i += 1000000) {
        stepsState.push(i);
    }
    selectList.forEach((list) => {
        list.querySelectorAll(".select-item").forEach(el => list.removeChild(el))
    })
    stepsState.forEach((elem, index) => {
        const item = templatePrice.content.cloneNode(true);
        createElement(item, "priceStart", elem, index);
        selectListStart.append(item);
    })
    stepsState.forEach((elem) => {
        const item = templatePrice.content.cloneNode(true);
        createElement(item, "priceStop", elem, elem);
        selectListStop.append(item);
    })
}
//создание списка ценового диапазона
function createElement(item, name, elem, pos) {
    item.querySelector(".select-price-radio").id = pos;
    item.querySelector(".select-price-radio").name = name;
    item.querySelector(".radio-text").htmlFor = pos;
    item.querySelector(".radio-text").innerText = elem;
}

//Загрузка данных из api
function showRegions(option) {
    const selectList = currentPopupState.querySelector(".select-list");
    currentPopupState.querySelectorAll(".select-item").forEach(el => selectList.removeChild(el));
    const currentOption = data[option].sort();
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
    const selectedData = btn.closest(".popup").querySelectorAll(".select-price-radio:checked");
    if (selectedData.length === 0) {
        return;
    }
    let newData = [];
    if (elemId === "price") {
        userData["prices_min"] = selectedData[0].nextElementSibling.textContent;
        userData["prices_max"] = selectedData[1].nextElementSibling.textContent;
        showEnters()
    } else {
        selectedData.forEach((elem) => {
            newData.push(elem.id);
        });
        userData[popupState] = newData;
        showEnters()
    }
    closePopup();
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
    showData = Object.values(userData).flat();
    showData.forEach(elem => {
        const li = document.createElement("li");
        li.classList.add("selected-item");
        const text = document.createTextNode(elem);
        li.appendChild(text);
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
function deleteSelectedElements(){
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
        perent.removeChild(item);
        if (perent.firstChild.nodeName === "P") {
            saveArea.classList.remove("selected-points_active");
            formDropFilterOpen.classList.remove("drop-filter-open_add");
            return;
        }
    })
}
//Поиск но названию
//отправка
//Отправка данных

