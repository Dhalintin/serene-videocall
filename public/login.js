const loginForm = document.getElementById('loginForm')

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const roomId = event.target.meeting_id.value;

    loadCall(email, roomId);
});

async function loadCall (email, roomId){
    try{
        const response = await fetch('https://serene-lbyk.onrender.com/api/v1/professional/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        if(response.ok){
            const data = await response.json({});
            const userData = {
                username: data.data.name,
                type: data.data.type,
                userId: data.data._id,
                avatar: data.data.image
            };
            localStorage.setItem('userInfo', JSON.stringify(userData));

            window.location.href = `/${roomId}`
        }

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}