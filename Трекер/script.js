var habits = [];
var selectedId = null;
var viewYear = new Date().getFullYear();
var viewMonth = new Date().getMonth();


var form = document.getElementById("habit-form");
var nameInput = document.getElementById("habit-name");
var methodSelect = document.getElementById("habit-method");
var nameError = document.getElementById("name-error");
var habitList = document.getElementById("habit-list");
var message = document.getElementById("message");
var habitTitle = document.getElementById("habit-title");
var monthTitle = document.getElementById("month-title");
var calendar = document.getElementById("calendar");

var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];


function save() {
  try {
    localStorage.setItem("habits", JSON.stringify(habits));
  } catch (e) {
    console.log("Не удалось сохранить данные", e);
  }
}

function load() {
  try {
    var data = localStorage.getItem("habits");
    if (data) {
      habits = JSON.parse(data);
    }
  } catch (e) {
    habits = [];
  }
}

function showMessage(text) {
  message.textContent = text;
  setTimeout(function () {
    message.textContent = "";
  }, 2500);
}


function formatDate(year, month, day) {
  var m = String(month + 1).padStart(2, "0");
  var d = String(day).padStart(2, "0");
  return year + "-" + m + "-" + d;
}

function todayString() {
  var t = new Date();
  return formatDate(t.getFullYear(), t.getMonth(), t.getDate());
}

function getSelectedHabit() {
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id === selectedId) {
      return habits[i];
    }
  }
  return null;
}


form.addEventListener("submit", function (event) {
  event.preventDefault();
  var name = nameInput.value.trim();

  
  if (name === "") {
    nameError.textContent = "Введите название привычки";
    return;
  }
  if (name.length < 2 || name.length > 30) {
    nameError.textContent = "Название должно быть от 2 до 30 символов";
    return;
  }
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].name.toLowerCase() === name.toLowerCase()) {
      nameError.textContent = "Такая привычка уже есть";
      return;
    }
  }

  nameError.textContent = "";
  var habit = {
    id: Date.now(),
    name: name,
    method: methodSelect.value,
    dates: []
  };
  habits.push(habit);
  selectedId = habit.id;
  form.reset();
  renderAll();
  save();
  showMessage("Привычка «" + habit.name + "» добавлена");
});

function renderHabits() {
  habitList.innerHTML = "";
  document.getElementById("habit-count").textContent = habits.length;

  if (habits.length === 0) {
    var empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Привычек пока нет. Добавьте первую выше.";
    habitList.appendChild(empty);
    return;
  }

  var today = todayString();

  habits.forEach(function (habit) {
    var li = document.createElement("li");
    if (habit.id === selectedId) {
      li.classList.add("active");
    }

    var left = document.createElement("div");
    var title = document.createElement("div");
    title.className = "habit-name";
    title.textContent = habit.name;
    var info = document.createElement("div");
    info.className = "habit-info";
    var methodText = habit.method ? "Метод: " + habit.method + " | " : "";
    info.textContent = methodText + "Серия: " + calcCurrentStreak(habit.dates) +
      " | Отметок: " + habit.dates.length;
    left.appendChild(title);
    left.appendChild(info);

    var buttons = document.createElement("div");
    buttons.className = "habit-buttons";

    var todayBtn = document.createElement("button");
    todayBtn.className = "today-btn";
    if (habit.dates.indexOf(today) !== -1) {
      todayBtn.classList.add("done");
      todayBtn.textContent = "Сегодня выполнено";
    } else {
      todayBtn.textContent = "Отметить сегодня";
    }
    todayBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      selectedId = habit.id;
      toggleDay(today);
    });

    var del = document.createElement("button");
    del.className = "del-btn";
    del.textContent = "Удалить";
    del.addEventListener("click", function (e) {
      e.stopPropagation();
      deleteHabit(habit.id);
    });

    buttons.appendChild(todayBtn);
    buttons.appendChild(del);
    li.appendChild(left);
    li.appendChild(buttons);
    li.addEventListener("click", function () {
      selectedId = habit.id;
      renderAll();
    });
    habitList.appendChild(li);
  });
}

function deleteHabit(id) {
  if (!confirm("Удалить привычку?")) {
    return;
  }
  habits = habits.filter(function (h) {
    return h.id !== id;
  });
  if (selectedId === id) {
    selectedId = null;
  }
  save();
  showMessage("Привычка удалена");
  renderAll();
}

document.getElementById("prev").addEventListener("click", function () {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  renderAll();
});

document.getElementById("next").addEventListener("click", function () {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderAll();
});

function renderCalendar() {
  calendar.innerHTML = "";
  monthTitle.textContent = monthNames[viewMonth] + " " + viewYear;

  var habit = getSelectedHabit();
  habitTitle.textContent = habit ? "Привычка: " + habit.name : "Выберите привычку";

  var names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  names.forEach(function (n) {
    var el = document.createElement("div");
    el.className = "day-name";
    el.textContent = n;
    calendar.appendChild(el);
  });

  
  var firstDay = new Date(viewYear, viewMonth, 1).getDay();
  var shift = (firstDay + 6) % 7;
  for (var s = 0; s < shift; s++) {
    calendar.appendChild(document.createElement("div"));
  }

  var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  var today = todayString();

  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = formatDate(viewYear, viewMonth, d);
    var cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = d;
    cell.setAttribute("data-date", dateStr);

    if (dateStr === today) {
      cell.classList.add("today");
    }
    if (dateStr > today) {
      cell.classList.add("future");
    }
    if (habit && habit.dates.indexOf(dateStr) !== -1) {
      cell.classList.add("done");
    }

    cell.addEventListener("click", function () {
      toggleDay(this.getAttribute("data-date"));
    });
    calendar.appendChild(cell);
  }
}

function toggleDay(dateStr) {
  var habit = getSelectedHabit();
  if (!habit) {
    showMessage("Сначала выберите привычку");
    return;
  }
  if (dateStr > todayString()) {
    showMessage("Нельзя отмечать будущие дни");
    return;
  }
  var index = habit.dates.indexOf(dateStr);
  if (index === -1) {
    habit.dates.push(dateStr);
  } else {
    habit.dates.splice(index, 1);
  }
  save();
  renderAll();
}


function dayDiff(a, b) {
  
  var d1 = new Date(a + "T00:00:00");
  var d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
}

function calcBestStreak(dates) {
  var sorted = dates.slice().sort();
  var best = 0;
  var run = 0;
  for (var i = 0; i < sorted.length; i++) {
    if (i > 0 && dayDiff(sorted[i - 1], sorted[i]) === 1) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) {
      best = run;
    }
  }
  return best;
}

function calcCurrentStreak(dates) {
  if (dates.length === 0) {
    return 0;
  }
  var sorted = dates.slice().sort();
  var last = sorted[sorted.length - 1];
  
  if (dayDiff(last, todayString()) > 1) {
    return 0;
  }
  var run = 1;
  for (var i = sorted.length - 1; i > 0; i--) {
    if (dayDiff(sorted[i - 1], sorted[i]) === 1) {
      run++;
    } else {
      break;
    }
  }
  return run;
}

function renderStats() {
  var habit = getSelectedHabit();
  var dates = habit ? habit.dates : [];

  var prefix = formatDate(viewYear, viewMonth, 1).slice(0, 7);
  var monthCount = 0;
  dates.forEach(function (d) {
    if (d.indexOf(prefix) === 0) {
      monthCount++;
    }
  });

  document.getElementById("current").textContent = calcCurrentStreak(dates);
  document.getElementById("best").textContent = calcBestStreak(dates);
  document.getElementById("total").textContent = dates.length;
  document.getElementById("month-count").textContent = monthCount;
}

function renderAll() {
  renderHabits();
  renderCalendar();
  renderStats();
}


load();
if (habits.length > 0) {
  selectedId = habits[0].id;
}
renderAll();
