const form = document.getElementById('solarForm');
const buildingRadios = document.getElementsByName('buildingType');
const billInput = document.getElementById('billInput');
const loadInput = document.getElementById('loadInput');
const consumerGroup = document.getElementById('consumerGroup');
const locationInput = document.getElementById('location');
const suggestionsBox = document.getElementById('suggestions');
const output = document.getElementById('output');

let selectedCoords = null;

locationInput.addEventListener('input', async () => {
  const query = locationInput.value.trim();
  if (query.length < 3) {
    suggestionsBox.innerHTML = '';
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  suggestionsBox.innerHTML = '';
  data.forEach((item) => {
    const div = document.createElement('div');
    div.textContent = item.display_name;
    div.onclick = () => {
      locationInput.value = item.display_name;
      suggestionsBox.innerHTML = '';
      selectedCoords = { lat: item.lat, lon: item.lon };

      output.innerHTML = `
        🌞 Selected Coordinates:<br>
        Latitude: ${selectedCoords.lat}<br>
        Longitude: ${selectedCoords.lon}<br>
        Estimated Solar Potential: ~5.5 kWh/m²/day (placeholder)
      `;
    };
    suggestionsBox.appendChild(div);
  });
});

form.addEventListener('change', () => {
  const selected = [...buildingRadios].find(r => r.checked);
  if (!selected) return;

  const type = selected.value;
  if (type === 'existing') {
    billInput.style.display = 'block';
    loadInput.style.display = 'none';
  } else {
    billInput.style.display = 'none';
    loadInput.style.display = 'block';
  }

  consumerGroup.style.display = 'block';
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!selectedCoords) {
    alert('Please select a valid location first!');
    return;
  }

  const buildingType = [...buildingRadios].find(r => r.checked)?.value;
  if (!buildingType) return alert('Select a building type');

  const consumerType = document.getElementById('consumerType').value;
  const tariff = (consumerType === 'R') ? 7 : (consumerType === 'C') ? 8 : 9;

  const genPerKW = 150;
  const costPerKW = 52500;
  const co2PerKWh = 0.92;
  const areaPerKW = 101;

  let systemSizeKW;

  if (buildingType === 'existing') {
    const monthlyBill = parseFloat(document.getElementById('monthlyBill').value);
    if (isNaN(monthlyBill) || monthlyBill <= 0) return alert('Enter valid monthly bill');
    systemSizeKW = (monthlyBill / tariff) / genPerKW;
  } else if (buildingType === 'new') {
    const sanctionedLoad = parseFloat(document.getElementById('sanctionedLoad').value);
    if (isNaN(sanctionedLoad) || sanctionedLoad <= 0) return alert('Enter valid sanctioned load');
    const diversityFactor = 0.7;
    const additionalLoadBuffer = 1.5;
    systemSizeKW = (sanctionedLoad * diversityFactor) + additionalLoadBuffer;
  }

  const monthlyGen = systemSizeKW * genPerKW;
  const monthlySavings = monthlyGen * tariff;
  const annualSavings = monthlySavings * 12;
  const totalCost = systemSizeKW * costPerKW;
  const co2Saved = monthlyGen * 12 * co2PerKWh;
  const areaRequired = systemSizeKW * areaPerKW;

  // Payback Calculation
  let cumulativeSavings = 0;
  let adjustedAnnualSavings = annualSavings;
  const degradationRate = 0.007;
  const tariffEscalation = 0.03;
  let accuratePayback = null;

  for (let year = 1; year <= 25; year++) {
    cumulativeSavings += adjustedAnnualSavings;
    if (cumulativeSavings >= totalCost && accuratePayback === null) {
      accuratePayback = year;
    }
    adjustedAnnualSavings *= (1 - degradationRate) * (1 + tariffEscalation);
  }

  const trees = co2Saved / 25.9;
  const cars = co2Saved / 1050;

  document.getElementById('systemSize').innerText = systemSizeKW.toFixed(1);
  document.getElementById('monthlyGen').innerText = Math.round(monthlyGen);
  document.getElementById('monthlySavings').innerText = Math.round(monthlySavings);
  document.getElementById('annualSavings').innerText = Math.round(annualSavings);
  document.getElementById('totalCost').innerText = Math.round(totalCost);
  document.getElementById('payback').innerText = accuratePayback ? accuratePayback + ' years' : '25+ years';
  document.getElementById('co2').innerText = Math.round(co2Saved);
  document.getElementById('areaRequired').innerText = Math.round(areaRequired);
  document.getElementById('treesSaved').innerText = Math.round(trees);
  document.getElementById('carsOffRoad').innerText = Math.round(cars);

  document.getElementById('result').style.display = 'block';
});














































































/*const form = document.getElementById('solarForm');
const billInput = document.getElementById('billInput');
const loadInput = document.getElementById('loadInput');
const locationInput = document.getElementById('location');
const suggestionsBox = document.getElementById('suggestions');
const output = document.getElementById('output');

let selectedCoords = null;

// Location suggestions
locationInput.addEventListener('input', async () => {
  const query = locationInput.value.trim();
  if (query.length < 3) {
    suggestionsBox.innerHTML = '';
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  suggestionsBox.innerHTML = '';
  data.forEach((item) => {
    const div = document.createElement('div');
    div.textContent = item.display_name;
    div.onclick = () => {
      locationInput.value = item.display_name;
      suggestionsBox.innerHTML = '';
      selectedCoords = { lat: item.lat, lon: item.lon };

      output.innerHTML = ` 
        🌞 Selected Coordinates:<br>
        Latitude: ${selectedCoords.lat}<br>
        Longitude: ${selectedCoords.lon}<br>
        Estimated Solar Potential: ~5.5 kWh/m²/day (placeholder)
      `;
    };
    suggestionsBox.appendChild(div);
  });
});

// Shared calculation function
function calculate(buildingType) {
  if (!selectedCoords) {
    alert('Please select a valid location first!');
    return;
  }

  const consumerType = document.getElementById('consumerType').value;
  const tariff = (consumerType === 'R') ? 7 : (consumerType === 'C') ? 8 : 9;

  const genPerKW = 150;
  const costPerKW = 52500;
  const co2PerKWh = 0.92;
  const areaPerKW = 101;

  let systemSizeKW;

  if (buildingType === 'existing') {
    const monthlyBill = parseFloat(document.getElementById('monthlyBill').value);
    if (isNaN(monthlyBill) || monthlyBill <= 0) {
      alert('Enter valid monthly bill');
      return;
    }
    systemSizeKW = (monthlyBill / tariff) / genPerKW;
  } else {
    const sanctionedLoad = parseFloat(document.getElementById('sanctionedLoad').value);
    if (isNaN(sanctionedLoad) || sanctionedLoad <= 0) {
      alert('Enter valid sanctioned load');
      return;
    }
    const diversityFactor = 0.7;
    const additionalLoadBuffer = 1.5;
    systemSizeKW = (sanctionedLoad * diversityFactor) + additionalLoadBuffer;
  }

  const monthlyGen = systemSizeKW * genPerKW;
  const monthlySavings = monthlyGen * tariff;
  const annualSavings = monthlySavings * 12;
  const totalCost = systemSizeKW * costPerKW;
  const co2Saved = monthlyGen * 12 * co2PerKWh;
  const areaRequired = systemSizeKW * areaPerKW;

  // Payback calculation
  let cumulativeSavings = 0;
  let adjustedAnnualSavings = annualSavings;
  const degradationRate = 0.007;
  const tariffEscalation = 0.03;
  let accuratePayback = null;

  for (let year = 1; year <= 25; year++) {
    cumulativeSavings += adjustedAnnualSavings;
    if (cumulativeSavings >= totalCost && accuratePayback === null) {
      accuratePayback = year;
    }
    adjustedAnnualSavings *= (1 - degradationRate) * (1 + tariffEscalation);
  }

  const trees = co2Saved / 25.9;
  const cars = co2Saved / 1050;

  // Output
  document.getElementById('systemSize').innerText = systemSizeKW.toFixed(1);
  document.getElementById('monthlyGen').innerText = Math.round(monthlyGen);
  document.getElementById('monthlySavings').innerText = Math.round(monthlySavings);
  document.getElementById('annualSavings').innerText = Math.round(annualSavings);
  document.getElementById('totalCost').innerText = Math.round(totalCost);
  document.getElementById('payback').innerText = accuratePayback ? accuratePayback + ' years' : '25+ years';
  document.getElementById('co2').innerText = Math.round(co2Saved);
  document.getElementById('areaRequired').innerText = Math.round(areaRequired);
  document.getElementById('treesSaved').innerText = Math.round(trees);
  document.getElementById('carsOffRoad').innerText = Math.round(cars);

  document.getElementById('result').style.display = 'block';
}

// Button handlers
document.getElementById('existingBtn').addEventListener('click', () => {
  billInput.style.display = 'block';
  loadInput.style.display = 'none';
  calculate('existing');
});

document.getElementById('newBtn').addEventListener('click', () => {
  billInput.style.display = 'none';
  loadInput.style.display = 'block';
  calculate('new');
}); */
