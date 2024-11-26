document.addEventListener('DOMContentLoaded', function () {
  // Initialize all modules
  initializeModules();
});

function initializeModules() {
  habitTrackerModule();
  mealsModule();
  themeToggleModule();
  taskModule();
  groceryModule();
}

function habitTrackerModule() {
  const habitForm = document.getElementById('habit-form');
  const habitTable = document.querySelector('#habit-table tbody');

  if (!habitForm) return;

  const habits = loadFromLocalStorage('habits', []);
  habits.forEach(addHabitToTable);

  habitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const habit = getFormData(habitForm, ['habit-title', 'habit-date', 'habit-time', 'habit-comment']);
    if (!habit.title || !habit.date || !habit.time) {
      alert('Please fill out all required fields.');
      return;
    }
    saveToLocalStorage('habits', habit);
    addHabitToTable(habit);
    habitForm.reset();
  });

  function addHabitToTable(habit) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${habit.title}</td>
      <td>${habit.date}</td>
      <td>${habit.time}</td>
      <td>${habit.comment || 'N/A'}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;
    habitTable.appendChild(row);

    row.querySelector('.delete-btn').addEventListener('click', function () {
      row.remove();
      deleteFromLocalStorage('habits', habit);
    });
  }
}

function mealsModule() {
  const mealsForm = document.getElementById('meals-form');
  const mealsList = document.getElementById('meals-list');
  const mealLog = document.getElementById('meal-log');

  if (!mealsForm) return;

  const meals = loadFromLocalStorage('meals', []);
  meals.forEach(meal => {
    addMealToList(meal);
    addMealToLog(meal);
  });

  mealsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const meal = getFormData(mealsForm, ['meal-input', 'meal-day']);
    saveToLocalStorage('meals', meal);
    addMealToList(meal);
    addMealToLog(meal);
    mealsForm.reset();
  });

  function addMealToList(meal) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${meal.day}: ${meal.name}</span>
      <button class="delete-meal">Delete</button>
    `;
    mealsList.appendChild(listItem);

    listItem.querySelector('.delete-meal').addEventListener('click', function () {
      listItem.remove();
      deleteFromLocalStorage('meals', meal);
      removeMealFromLog(meal);
    });
  }

  function addMealToLog(meal) {
    const logItem = document.createElement('li');
    logItem.textContent = `${meal.day}: ${meal.name}`;
    mealLog.appendChild(logItem);
  }

  function removeMealFromLog(mealToDelete) {
    Array.from(mealLog.children).forEach(item => {
      if (item.textContent.includes(mealToDelete.name) && item.textContent.includes(mealToDelete.day)) {
        item.remove();
      }
    });
  }
}

function themeToggleModule() {
  const themeToggleButton = document.getElementById('theme-toggle');
  if (!themeToggleButton) return;

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeToggleButton.textContent = theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    localStorage.setItem('theme', theme);
  }

  function setThemeBasedOnTime() {
    const currentHour = new Date().getHours();
    const defaultTheme = currentHour >= 6 && currentHour < 18 ? 'light' : 'dark';
    const savedTheme = localStorage.getItem('theme') || defaultTheme;
    applyTheme(savedTheme);
  }

  setThemeBasedOnTime();

  themeToggleButton.addEventListener('click', function () {
    const currentTheme = document.body.getAttribute('data-theme');
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
  });
}

function groceryModule() {
  const groceryForm = document.getElementById('grocery-form');
  const groceryList = document.getElementById('grocery-list');
  const groceryArchive = document.getElementById('grocery-archive');

  if (!groceryForm) return;

  const groceries = loadFromLocalStorage('groceries', []);
  groceries.forEach(groceryItem => {
    groceryItem.completed ? addGroceryToArchive(groceryItem) : addGroceryToList(groceryItem);
  });

  groceryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const groceryItem = getFormData(groceryForm, ['grocery-item', 'grocery-quantity', 'grocery-location', 'grocery-category']);
    groceryItem.completed = false;
    saveToLocalStorage('groceries', groceryItem);
    addGroceryToList(groceryItem);
    groceryForm.reset();
  });

  function addGroceryToList(groceryItem) {
    const listItem = createGroceryListItem(groceryItem, false);
    groceryList.appendChild(listItem);
  }

  function addGroceryToArchive(groceryItem) {
    const listItem = createGroceryListItem(groceryItem, true);
    groceryArchive.appendChild(listItem);
  }

  function createGroceryListItem(groceryItem, isArchived) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${groceryItem.quantity} x ${groceryItem.itemName} (${groceryItem.category}) @ ${groceryItem.location}</span>
      <div>
        <input type="checkbox" ${groceryItem.completed ? 'checked' : ''}>
        <button>Delete</button>
      </div>
    `;

    listItem.querySelector('input[type="checkbox"]').addEventListener('change', function () {
      groceryItem.completed = this.checked;
      updateGroceryInLocalStorage(groceryItem);
      listItem.remove();
      groceryItem.completed ? addGroceryToArchive(groceryItem) : addGroceryToList(groceryItem);
    });

    listItem.querySelector('button').addEventListener('click', function () {
      listItem.remove();
      deleteFromLocalStorage('groceries', groceryItem);
    });

    return listItem;
  }
}

/* Utility Functions */
function loadFromLocalStorage(key, defaultValue) {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

function saveToLocalStorage(key, item) {
  const items = loadFromLocalStorage(key, []);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
}

function deleteFromLocalStorage(key, itemToDelete) {
  const items = loadFromLocalStorage(key, []);
  const updatedItems = items.filter(item => JSON.stringify(item) !== JSON.stringify(itemToDelete));
  localStorage.setItem(key, JSON.stringify(updatedItems));
}

function getFormData(form, fields) {
  const data = {};
  fields.forEach(field => {
    data[field.replace('-', '_')] = form.querySelector(`#${field}`).value.trim();
  });
  return data;
}

function updateGroceryInLocalStorage(updatedItem) {
  const groceries = loadFromLocalStorage('groceries', []);
  const updatedGroceries = groceries.map(item => (JSON.stringify(item) === JSON.stringify(updatedItem) ? updatedItem : item));
  localStorage.setItem('groceries', JSON.stringify(updatedGroceries));
}