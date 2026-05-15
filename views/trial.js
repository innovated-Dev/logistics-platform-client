
const container = document.getElementById('container');

const innerContainer = document.getElementById('innerContainer');

const select = document.createElement('select');

innerContainer.appendChild(select);
const citySelect = document.getElementById('Select'); // grab the existing one

citySelect.addEventListener('change', (e)=> {
    e.preventDefault();

    const selectedCity = citySelect.value
    console.log(selectedCity)
    const zones = {
                Lagos:  [
                        "Surulere",
                        "lekki Phase",
                        "Magodo",
                        "Bariga"
                    ],
                Ibadan: [
                        "Agodi",
                        "Ojoo",
                        "Bodija",
                        "Agbowo"
                    ]

            };

    const matchingZones = zones[selected];
    console.log(matchingZones);

    matchingZones.forEach((zone) => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        select.appendChild(option);
    });  
});




     

      
