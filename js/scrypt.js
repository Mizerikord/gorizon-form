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
const formOpen = document.querySelector(".filter-bar");
const regions = document.querySelectorAll(".drop-btn__name");
const popup = document.querySelector(".popup");

let popupState = "";
let currentPopupState = "";
let stepsState = [];


//раскрытие списка фильтров

//Закрытие при клике мимо попапа
document.addEventListener("click", (e) => {
    if (!e.target.closest(".popup-enable") && !e.target.classList.contains("drop-btn__name")) {
        closePopup();
        return;
    }
})

//Закрываем доп секцию
document.querySelector(".filter-bar-bottom").style.display = "none";

//Вешаем обработчики на внешние элементы
formElemOpen.addEventListener("click", () => { openForm() })
formMapElem.addEventListener("click", () => { checkVisibleMap() })
formPrev.addEventListener("click", () => {
    formOpen.classList.toggle("filter-bar_open");
})

//Вешаем обработчики на раскрытие попапа при клике на окна
regions.forEach((reg) => {
    reg.addEventListener("click", (e) => {
        if (popupState === e.target.parentNode.id) {
            closePopup();
            return;
        }
        if (popupState !== e.target.parentNode.id && popupState !== "") {
            closePopup();
        }
        if (e.target.parentNode.id === "price") {
            currentPopupState = document.querySelector(`.${e.target.parentNode.id}`);
            popupState = e.target.parentNode.id;
            e.target.parentNode.appendChild(currentPopupState);
            currentPopupState.classList.add("popup-enable");
            createMathPrice(data)
            return;
        }
        currentPopupState = document.querySelector(`.${e.target.parentNode.id}`);
        popupState = e.target.parentNode.id;
        e.target.parentNode.appendChild(currentPopupState);
        currentPopupState.classList.add("popup-enable");
        showRegions(e.target.parentNode.id);
        return;
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

//галочка на "показать объекты на карте"
function checkVisibleMap() {
    formDescriptionEl.classList.toggle("description-hover_active");
    return;
}

//Перенос кнопки --Показать-- со всеми изменениями формы
function replaceElem() {
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
    currentPopupState.classList.remove("popup-enable");
    popupState = "";
    currentPopupState = "";
    stepsState = [];
}

//Создание диапазона цен
function createMathPrice(data) {
    const selectList = currentPopupState.querySelectorAll(".select-list");
    const minPrice = Math.floor(data.prices_min / 100000) * 100000;
    const maxPrice = Math.ceil(data.prices_max / 100000) * 100000;

    for (let i = minPrice; i < maxPrice; i += 1000000) {
        stepsState.push(i);
    }

    const selectListStart = currentPopupState.querySelector(".select-list_start");
    const selectListStop = currentPopupState.querySelector(".select-list_stop");

    selectList.forEach((list) => {
        list.querySelectorAll(".select-item").forEach(el => list.removeChild(el))
    })

    stepsState.forEach((elem) => {
        const li = selectListStart.appendChild(document.createElement("li"));
        li.classList.add("select-item");
        li.addEventListener("click", () => {
            li.classList.toggle("select-item_active");
        })
        li.innerText = elem;
    })

    stepsState.forEach((elem) => {
        const li = selectListStop.appendChild(document.createElement("li"));
        li.classList.add("select-item");
        li.addEventListener("click", () => {
            li.classList.toggle("select-item_active");
        })
        li.innerText = elem;
    })
}

//подгрузка данных из api
function showRegions(option) {
    const selectList = currentPopupState.querySelector(".select-list");
    currentPopupState.querySelectorAll(".select-item").forEach(el => selectList.removeChild(el));
    const currentOption = data[option];
    currentOption.forEach((elem) => {
        const li = selectList.appendChild(document.createElement("li"));
        li.classList.add("select-item");
        li.addEventListener("click", () => {
            li.classList.toggle("select-item_active");
        })
        li.innerText = elem;
    })
}
