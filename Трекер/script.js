var habits = JSON.parse(localStorage.getItem('habits')) || [];
var selected = -1;

var message = document.getElementById('message');
var nameInput = document.getElementById('habit-name');
var nameError = document.getElementById('name-error');
var list = document.getElementById('habit-list');
var calendar = document.getElementById('calendar');

function save() {
  localStorage.setItem('habits', JSON.stringify(habits));
}


function dateToStr(date) {
  var m = date.getMonth() + 1;
  var d = date.getDate();
  if (m < 10) m = '0' + m;
  if (d < 10) d = '0' + d;
  return date.getFullYear() + '-' + m + '-' + d;
}


function getStreak(marks) {
  var d = new Date();
  var count = 0;
  if (!marks.includes(dateToStr(d))) {
    d.setDate(d.getDate() - 1);
  }
  while (marks.includes(dateToStr(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function showAll() {
  
  list.innerHTML = '';
  for (var i = 0; i < habits.length; i++) {
    var li = document.createElement('li');
    li.textContent = habits[i].name;
    li.dataset.index = i;
    if (i == selected) li.classList.add('active');
    var del = document.createElement('button');
    del.textContent = 'Удалить';
    del.className = 'delete';
    li.appendChild(del);
    list.appendChild(li);
  }

  
  calendar.innerHTML = '';
  var title = document.getElementById('habit-title');
  if (selected == -1) {
    title.textContent = 'Выберите привычку';
    document.getElementById('streak').textContent = 0;
    document.getElementById('total').textContent = 0;
    return;
  }
  var marks = habits[selected].marks;
  title.textContent = 'Привычка: ' + habits[selected].name;
  document.getElementById('streak').textContent = getStreak(marks);
  document.getElementById('total').textContent = marks.length;

  var now = new Date();
  var days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  var first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  if (first == 0) first = 7;
  for (var j = 1; j < first; j++) {
    calendar.appendChild(document.createElement('div'));
  }
  for (var day = 1; day <= days; day++) {
    var date = dateToStr(new Date(now.getFullYear(), now.getMonth(), day));
    var btn = document.createElement('button');
    btn.textContent = day;
    btn.dataset.date = date;
    if (marks.includes(date)) btn.classList.add('marked');
    calendar.appendChild(btn);
  }
}


document.getElementById('habit-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var name = nameInput.value.trim();
  if (name.length < 2 || name.length > 30) {
    nameError.textContent = 'Название должно быть от 2 до 30 символов';
    return;
  }
  nameError.textContent = '';
  habits.push({ name: name, marks: [] });
  selected = habits.length - 1;
  nameInput.value = '';
  save();
  showAll();
});


list.addEventListener('click', function (e) {
  var li = e.target.closest('li');
  if (li == null) return;
  if (e.target.className == 'delete') {
    habits.splice(li.dataset.index, 1);
    selected = -1;
    save();
  } else {
    selected = Number(li.dataset.index);
  }
  showAll();
});


calendar.addEventListener('click', function (e) {
  var date = e.target.dataset.date;
  if (date === undefined) return;
  if (date > dateToStr(new Date())) {
    message.textContent = 'Нельзя отмечать будущие дни';
    return;
  }
  message.textContent = '';
  var marks = habits[selected].marks;
  var pos = marks.indexOf(date);
  if (pos == -1) {
    marks.push(date);
  } else {
    marks.splice(pos, 1);
  }
  save();
  showAll();
});

