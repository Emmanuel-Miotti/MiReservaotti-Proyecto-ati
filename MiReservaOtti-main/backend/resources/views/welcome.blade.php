<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Anteproyecto </title>
    <meta name="csrf-token" content="{{ csrf_token() }}">


    {{-- <script src="https://www.google.com/recaptcha/api.js?render=6LcXKe0pAAAAAAsojlj2cwfT_G5he6DYNuKg_bkx"></script>


    <script>
        document.addEventListener('submit', function(e) {
            e.preventDefault();
            grecaptcha.ready(function() {
                grecaptcha.execute('6LcXKe0pAAAAAAsojlj2cwfT_G5he6DYNuKg_bkx', {
                    action: 'submit'
                }).then(function(token) {
                    let form = e.target;

                    let input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'g-recaptcha-response';
                    input.value = token;

                    form.appendChild(input);

                    form.submit();


                });
            });


        })
    </script> --}}










    {{-- 
    <script>
        $(document).ready(function(
            $('#btnRegistrarse').click(function(

                grecaptcha.ready(function() {
                    grecaptcha.execute('6LeaaecpAAAAAPY2rWI3mKZIOpNXCYpViriBiNmq', {
                        action: 'submit'
                    }).then(function(token) {
                        $('#form-login').prepend('<input type="hidden" name="token" value="' +token + '">')
                        $('#form-login').prepend('<input type="hidden" name="token" value="' +token + '">')
                        $('#form-login').prepend('<input type="hidden" name="token" value="' +token + '">')
                        // Add your logic to submit to your backend server here.
                    });
                });


            ) {

            })

        ) {

        })
    </script> --}}
</head>

<body>
    <div id="root"></div>
</body>

</html>
