function handleLogin(){
    $('.js-login').submit(e =>{
        e.preventDefault();
        let email = $(e.currentTarget).find('#login-email').val();
        console.log(email);
        let password = $(e.currentTarget).find('#user-password').val();
        console.log(password);
        let valid = validateLogin(email, password);
        console.log(valid);
        if(!(valid = true)){
            alert("something went wrong")
        }
        else {
            $('.js-landing-page').addClass("hidden");
             $('.js-event-page').removeClass("hidden");};
    });
};

function validateLogin(email, password){
    console.log(email);
    if(!(email.includes('@'))){
        alert("Please enter a valid email");
        return false;
    }

}

function handleActivity(){
    $('.js-event-page').on('click', '.activity', e =>{
        $('.js-event-page').addClass("hidden");
        $('.js-activity-page').removeClass("hidden");
    });
};

handleLogin();
handleActivity();