const form = document.getElementById('solarForm');
const buildingRadios = document.getElementsByName('buildingType');
const billInput = document.getElementById('billInput');
const loadInput = document.getElementById('loadInput');
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
  const selected = [...buildingRadios].find(r => r.checked).value;
  billInput.style.display = selected === 'existing' ? 'block' : 'none';
  loadInput.style.display = selected === 'new' ? 'block' : 'none';
});

form.addEventListener('submit', function(e) {
  e.preventDefault();

  if (!selectedCoords) {
    alert('Please select a valid location first!');
    return;
  }

  const buildingType = [...buildingRadios].find(r => r.checked).value;
  const consumerType = document.getElementById('consumerType').value;
  const tariff = (consumerType === 'R') ? 7 : (consumerType === 'C') ? 8 : 9;

  // Updated values for realistic comparison with MySun
  const genPerKW = 150; // kWh/month/kW
  const costPerKW = 52500; // ₹
  const co2PerKWh = 0.92; // kg CO2 per kWh
  const areaPerKW = 101; // sq. ft

  let systemSizeKW;

  if (buildingType === 'existing') {
    const monthlyBill = parseFloat(document.getElementById('monthlyBill').value);
    if (isNaN(monthlyBill) || monthlyBill <= 0) return alert('Enter valid bill amount');
    systemSizeKW = (monthlyBill / tariff) / genPerKW;
  } else {
    const sanctionedLoad = parseFloat(document.getElementById('sanctionedLoad').value);
    if (isNaN(sanctionedLoad) || sanctionedLoad <= 0) return alert('Enter valid sanctioned load');
    systemSizeKW = sanctionedLoad * 0.8;
  }

  const monthlyGen = systemSizeKW * genPerKW;
  const monthlySavings = monthlyGen * tariff;
  const annualSavings = monthlySavings * 12;
  const totalCost = systemSizeKW * costPerKW;
  const payback = totalCost / annualSavings;
  const co2Saved = monthlyGen * 12 * co2PerKWh;
  const areaRequired = systemSizeKW * areaPerKW;

  const trees = co2Saved / 25.9;
  const cars = co2Saved / 1050;

  // Display
  document.getElementById('systemSize').innerText = systemSizeKW.toFixed(1);
  document.getElementById('monthlyGen').innerText = Math.round(monthlyGen);
  document.getElementById('monthlySavings').innerText = Math.round(monthlySavings);
  document.getElementById('annualSavings').innerText = Math.round(annualSavings);
  document.getElementById('payback').innerText = payback.toFixed(1);
  document.getElementById('co2').innerText = Math.round(co2Saved);
  document.getElementById('areaRequired').innerText = Math.round(areaRequired);
  document.getElementById('treesSaved').innerText = Math.round(trees);
  document.getElementById('carsOffRoad').innerText = Math.round(cars);

  document.getElementById('result').style.display = 'block';
});
