document.addEventListener('DOMContentLoaded', function () {
  initializeModules();
});

function initializeModules() {
  taskAssignmentModule();
  mealsModule();
  groceryModule();
  themeToggleModule();
}

/* Task Assignment Module */
function taskAssignmentModule() {
  const taskForm = document.getElementById('task-form');
  const tasksEllie = document.getElementById('tasks-ellie');
  const tasksAlexie = document.getElementById('tasks-alexie');

  if (!taskForm || !tasksEllie || !tasksAlexie) {
    console.error('Task assignment elements are missing from the DOM.');
    return;
  }

  // Load tasks from local storage and render them
  const tasks = loadFromLocalStorage('tasks', []);
  tasks.forEach(addTaskToList);

  // Handle task form submission
  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Retrieve form data
    const task = getFormData(taskForm, ['task-title', 'task-assigned-to', 'task-reward']);
    console.log('Form data:', task);

    // Validation
    if (!task.task_title.trim() || !task.task_assigned_to.trim() || task.task_reward.trim() === '') {
      alert('Please fill out all required fields.');
      return;
    }

    // Save task to local storage and add to list
    saveToLocalStorage('tasks', task);
    addTaskToList(task);
    taskForm.reset();
  });

  function addTaskToList(task) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      ${task.task_title} - $${task.task_reward} 
      <button class="delete-task">Delete</button>
    `;

    // Determine which list to add the task to
    let list;
    if (task.task_assigned_to === 'Éllie') {
      list = tasksEllie;
    } else if (task.task_assigned_to === 'Alexie') {
      list = tasksAlexie;
    } else {
      console.error('Invalid assignment:', task.task_assigned_to);
      return;
    }

    // Append task to the appropriate list
    list.appendChild(listItem);

    // Add delete functionality
    listItem.querySelector('.delete-task').addEventListener('click', function () {
      listItem.remove();
      deleteFromLocalStorage('tasks', task);
    });
  }
}

/* Utility function for getting form data */
function getFormData(form, fields) {
  const data = {};
  fields.forEach(field => {
    const value = form.querySelector(`#${field}`)?.value.trim();
    data[field.replace('-', '_')] = value || ''; // Ensure empty string for missing fields
    if (!form.querySelector(`#${field}`)) {
      console.error(`Field with ID ${field} not found in the form.`);
    }
  });
  return data;
}

/* Meals Module */
function mealsModule() {
  const mealsForm = document.getElementById('meals-form');
  const mealsList = document.getElementById('meals-list');

  if (!mealsForm || !mealsList) {
    console.error('Meals form or list is missing from the DOM.');
    return;
  }

  const meals = loadFromLocalStorage('meals', []);
  meals.forEach(addMealToList);

  mealsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const meal = getFormData(mealsForm, ['meal-input', 'meal-day']);
    if (!meal.meal_input || !meal.meal_day) {
      alert('Please fill out all required fields.');
      return;
    }

    saveToLocalStorage('meals', meal);
    addMealToList(meal);
    mealsForm.reset();
  });

  function addMealToList(meal) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      ${meal.meal_day}: ${meal.meal_input}
      <button class="delete-meal">Delete</button>
    `;
    mealsList.appendChild(listItem);

    listItem.querySelector('.delete-meal').addEventListener('click', function () {
      listItem.remove();
      deleteFromLocalStorage('meals', meal);
    });
  }
}

/* Grocery List Module */
function groceryModule() {
  const groceryForm = document.getElementById('grocery-form');
  const groceryList = document.getElementById('grocery-list');
  const groceryArchive = document.getElementById('grocery-archive');

  if (!groceryForm || !groceryList || !groceryArchive) {
    console.error('Grocery form, list, or archive is missing from the DOM.');
    return;
  }

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
      <span>${groceryItem.grocery_quantity} x ${groceryItem.grocery_item} (${groceryItem.grocery_category}) @ ${groceryItem.grocery_location}</span>
      <div>
        <input type="checkbox" ${groceryItem.completed ? 'checked' : ''}>
        <button>Delete</button>
      </div>
    `;

    listItem.querySelector('input[type="checkbox"]').addEventListener('change', function () {
      groceryItem.completed = this.checked;
      updateLocalStorage('groceries', groceryItem);
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

/* Theme Toggle Module */
function themeToggleModule() {
  const themeToggleButton = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeToggleButton.textContent = theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    localStorage.setItem('theme', theme);
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggleButton.addEventListener('click', function () {
    const currentTheme = document.body.getAttribute('data-theme');
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
  });
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