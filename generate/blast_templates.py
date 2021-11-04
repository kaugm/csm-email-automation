'''
Template generator functions
Each function takes in variables and returns a tuple in the following format:
{variables surrounded by backets} apostrophes escaped by \'
( email subject, email body )
'''

from settings import csm_name

def intro(name, product, signature):
    return (f'''Citrix & {name} | Customer Success Intro''', 
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>
            
            If you have any questions or concerns at all, please don’t hesitate to reach out and let me know. If not, feel free to save my contact and reach out at any time. Here to help!<br><br>Also don\'t forget to check out our <a href="https://success.citrix.com/#!/static-pages/home">Citrix Success Center</a> for build guides, rollout communication resources, and more.<br><br>

            {signature}''')

def checkin(name, product, signature):
    return (f'''Citrix & {name} | Check in''', 
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>

            {signature}''')


def admin_workshop(name, product, signature):
    return (f'''Citrix & {name} | Talk with a Technical Expert''',
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>

            If you have any questions about this type of session, its purpose, etc., please let me know!<br><br>

            {signature}''')


def arch_and_strat(name, product, signature):
    return (f'''Citrix & {name} | Talk with a Technical Expert''',
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>

            If you have any questions about this type of session, its purpose, etc., please let me know!<br><br>

            {signature}''')


def read_review(name, product, signature):
    return (f'''Citrix & {name} | Talk with a Technical Expert''',
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>

            {signature}''')


def custom(name, product, signature):
    return (f'''Citrix & {name}''', 
            f'''<html>
            <body>
            Hey {name} Team, <br><br><br><br>

            {signature}''')


def renewal(name, product, signature):
    return (f'''Citrix & {name} | Your Upcoming Renewal''', 
            f'''<html>
            <body>
            Hey {name} Team, <br><br>

            <strong>PROPRIETARY EMAIL TEXT HERE. I removed the actual template text just to be safe, as this will be uploaded.</strong>

            {signature}''')