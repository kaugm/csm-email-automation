'''
Template generator functions
Each function takes in variables and returns a tuple in the following format:
{variables surrounded by backets} apostrophes escaped by \'
( email subject, email body )
'''

def lead(name, account_owner, comment, url, signature):
    return (f'''Lead created for {name} due to {comment}''', 
            f'''<html>
            <body>
            Hey {account_owner}, <br><br>

            I hope you\'re doing well, reaching out to let you know that I have created a lead for {name} due to: {comment}. I\'ve included the link to the lead below. Just wanted to let you know, as this is a great opportunity for expansion. <br><br>

            Link to lead: {url}<br><br>

            {signature}''')
