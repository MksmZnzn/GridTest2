// $(document).ready(function() {
//
//     //открытие дропдауна
//     $(document).on('click', '.select-header', function() {
//         const dropdown = $(this).find('.select-dropdown');
//         $('.select-dropdown').not(dropdown).addClass('select-hide').hide();
//         dropdown.toggleClass('select-hide').toggle();
//     });
//
//     //закрытие дропдауна
//     $(document).on('click', function(e) {
//         if (!$(e.target).closest('.custom-select').length) {
//             $('.select-dropdown').addClass('select-hide').hide();
//         }
//     });
//
//     //загрузка уникальных данных
//     function loadUniqueValues(column, isDate = false) {
//         console.log(`Loading unique values for column: ${column}`);
//         $.get('/Home/GetUniqueValues', { column: column }, function(data) {
//             if (data.success) {
//                 console.log(`Successfully loaded unique values for column: ${column}`);
//                 fillSelect(`.select-dropdown[data-filter-column="${column}"]`, data.values, isDate);
//             } else {
//                 console.error(`Failed to load unique values for column ${column}: ${data.message}`);
//             }
//         }).fail(function() {
//             console.error(`Failed to load unique values for column ${column}`);
//         });
//     }
//
//
//
//     // Функция для удаления значения из фильтра
//     function removeFilterValue(column, value) {
//         if (filters[column]) {
//             const index = filters[column].indexOf(value);
//             if (index !== -1) {
//                 filters[column].splice(index, 1);
//             }
//         }
//     }
//
//     $(document).on('click', '.select-dropdown input[type="checkbox"]', function(event) {
//         event.stopPropagation();
//     });
//
//
//
//     //заполнение фильтров данными
//     function fillSelect(selector, values, isDate = false) {
//         console.log(`Filling select: ${selector}`);
//         const select = $(selector);
//         values.forEach(value => {
//             let displayValue = value;
//             if (isDate) {
//                 const date = new Date(value);
//                 const day = String(date.getDate()).padStart(2, '0');
//                 const month = String(date.getMonth() + 1).padStart(2, '0');
//                 const year = date.getFullYear();
//                 displayValue = `${day}.${month}.${year}`;
//             }
//             select.append($('<div>').append($('<input type="checkbox">').val(value)).append($('<label>').text(displayValue)));
//         });
//     }
//
//     $(document).on('change', '.select-dropdown input[type="checkbox"]', function() {
//         const column = $(this).closest('.select-dropdown').data('filter-column');
//         const selectedValues = [];
//
//         $(this).closest('.select-dropdown').find('input[type="checkbox"]:checked').each(function() {
//             selectedValues.push($(this).val());
//         });
//
//         // Создаем словарь с текущим фильтром
//         const newFilter = {};
//         newFilter[column] = { method: 'in', value: selectedValues };
//
//         // Проверяем, существует ли уже фильтр с данным ключом
//         let existingFilterIndex = -1;
//         for (let i = 0; i < filterArrays.length; i++) {
//             if (filterArrays[i][column]) {
//                 existingFilterIndex = i;
//                 break;
//             }
//         }
//
//         if (existingFilterIndex !== -1) {
//             // Обновляем существующий фильтр, добавляя новые значения
//             filterArrays[existingFilterIndex][column].value = selectedValues;
//         } else {
//             // Иначе добавляем новый фильтр в массив
//             filterArrays.push(newFilter);
//         }
//
//         // Преобразуем filterArrays в строку JSON
//         const filterArraysJSON = JSON.stringify(filterArrays);
//
//         console.log('filterArrays', filterArraysJSON);
//
//         loadData(); // Загружаем данные с учетом новых фильтров
//     });
//
//     loadUniqueValues("Id");
//     loadUniqueValues("Name");
//     loadUniqueValues("Age");
//     loadUniqueValues("BirthDay", true);
// });
//
// let rowsPerPage = 3;
// let currentPage = 1;
// let sortColumn = '';
// let sortAscending = true;
// let filters = {};
// let filterArrays = [];
// let totalItems = 0;
// let selectedValues = []; // Инициализация переменной
//
// $(document).ready(function () {
//     loadData();
//
//     $('#grid').on('click', 'th.sortable', function(e) {
//         if (!$(e.target).closest('.custom-select').length) {
//             sortColumn = $(this).data('column');
//             sortAscending = !sortAscending;
//             $('#grid .sortable').removeClass('asc desc');
//             $(this).addClass(sortAscending ? 'asc' : 'desc');
//             currentPage = 1;
//             loadData();
//         }
//     });
//
//     $('.pagination').on('click', '.page', function() {
//         currentPage = parseInt($(this).text());
//         loadData();
//     });
//
//     $('.pagination .prev').on('click', function() {
//         if (currentPage > 1) {
//             currentPage--;
//             loadData();
//         }
//     });
//
//     $('.pagination .next').on('click', function() {
//         if (currentPage < Math.ceil(totalItems / rowsPerPage)) {
//             currentPage++;
//             loadData();
//         }
//     });
//
//     $('.pagination .first').on('click', function() {
//         currentPage = 1;
//         loadData();
//     });
//
//     $('.pagination .last').on('click', function() {
//         currentPage = Math.ceil(totalItems / rowsPerPage);
//         loadData();
//     });
//
//     $('.rows-per-page-select').on('change', function () {
//         const selectedValue = $(this).val();
//         rowsPerPage = selectedValue === 'all' ? totalItems : parseInt(selectedValue);
//         currentPage = 1;
//         loadData();
//     });
//
//     $('#grid thead input').on('focusout', function() {
//         const filterColumn = $(this).data('filter-column');
//         const filterValue = $(this).val();
//         const filterMethod = $(`select[data-filter-column='${filterColumn}']`).val();
//         filters[filterColumn] = { method: filterMethod, value: filterValue };
//         currentPage = 1;
//         loadData();
//     });
//
//     $(document).on('focusout', '#firstDateInput, #lastDateInput', function() {
//         const column = $(this).data('filter-column');
//         const firstDate = $('#firstDateInput').val();
//         const lastDate = $('#lastDateInput').val();
//
//         // Создаем словарь с текущим фильтром
//         const newFilter = {};
//         newFilter[column] = { method: 'between', value: [firstDate, lastDate] };
//
//         // Проверяем, существует ли уже фильтр с данным ключом
//         let existingFilterIndex = -1;
//         for (let i = 0; i < filterArrays.length; i++) {
//             if (filterArrays[i][column]) {
//                 existingFilterIndex = i;
//                 break;
//             }
//         }
//
//         if (existingFilterIndex !== -1) {
//             // Обновляем существующий фильтр, добавляя новые значения
//             filterArrays[existingFilterIndex][column].value = [firstDate, lastDate];
//         } else {
//             // Иначе добавляем новый фильтр в массив
//             filterArrays.push(newFilter);
//         }
//
//         // Преобразуем filterArrays в строку JSON
//         const filterArraysJSON = JSON.stringify(filterArrays);
//
//         console.log('filterArrays', filterArraysJSON);
//
//         loadData(); // Загружаем данные с учетом новых фильтров
//     });
//
//
//     $('#grid thead select').on('change', function() {
//         const filterColumn = $(this).data('filter-column');
//         const filterMethod = $(this).val();
//         const filterValue = $(`input[data-filter-column='${filterColumn}']`).val();
//         if (filterMethod === 'between') {
//             $('.inputDate.first, .inputDate.last').show();
//             $('.inputDate.solo').hide();
//         } else {
//             $('.inputDate.solo').show();
//             $('.inputDate.first, .inputDate.last').hide();
//         }
//
//     });
//
// });
// $(document).ready(function () {
//     function loadData() {
//         const filterMethods = Object.keys(filters).map(key => filters[key].method).join(',');
//         const filterValues = Object.keys(filters).map(key => {
//             const value = filters[key].value;
//             return Array.isArray(value) ? value.join('|') : value;
//         }).join(',');
//         const filterColumns = Object.keys(filters).join(',');
//
//         $.ajax({
//             url: '@Url.Action("GetGirdData", "Home")',
//             method: 'GET',
//             data: {
//                 sortColumn: sortColumn,
//                 ascending: sortAscending,
//                 filterColumn: filterColumns,
//                 filterMethod: filterMethods,
//                 filterValue: filterValues,
//                 page: currentPage,
//                 pageSize: rowsPerPage,
//                 filterArrays: JSON.stringify(filterArrays)
//             },
//             success: function(response) {
//
//                 const data = response.data;
//                 $('#grid-body').empty();
//                 let ageSum = 0;
//                 $.each(data, function(index, item) {
//                     const formattedDate = new Date(item.birthDay).toLocaleDateString('ru-RU');
//                     $('#grid-body').append(`<tr>
//                 <td>${item.id}</td>
//                 <td>${item.name}</td>
//                 <td>${item.age}</td>
//                 <td>${formattedDate}</td>
//             </tr>`);
//                     ageSum += item.age;
//                 });
//
//                 totalItems = response.totalCount;
//                 $('#average-age').text('Сред.: ' + Math.round(response.averageAge));
//                 updatePagination(totalItems);
//                 $('#total-count').text('Всего: '+ totalItems);
//                 $('#lines-selected').text('Отмечено: ' + selectedValues.length);
//             },
//             error: function() {
//                 alert('Error loading data.');
//             }
//         });
//     }
//
//     function updatePagination(totalItems) {
//         let totalPages = Math.ceil(totalItems / rowsPerPage);
//         let pageNumbers = $('.page-numbers');
//         pageNumbers.empty();
//
//         for (let i = 1; i <= totalPages; i++) {
//             if (i === currentPage) {
//                 pageNumbers.append(`<button class="page active" disabled>${i}</button>`);
//             } else {
//                 pageNumbers.append(`<button class="page">${i}</button>`);
//             }
//         }
//
//         $('.pagination .prev').prop('disabled', currentPage <= 1);
//         $('.pagination .next').prop('disabled', currentPage >= totalPages);
//         $('.pagination .first').prop('disabled', currentPage <= 1);
//         $('.pagination .last').prop('disabled', currentPage >= totalPages);
//     }
// });
