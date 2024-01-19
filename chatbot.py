from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext
from datetime import datetime, timedelta
import re

initial_squads = ["Alchemist", "Invoker", "Jugg", "Riki", "Spectre", "Tiny"]
start_schedule = datetime(2024, 1, 1)
squads_members = {
    "Tiny": ["dylan", "hieuvm13", "dunglm11"],
    "Spectre": ["giangpt14", "anhhtv8", "linhnvh3"],
    "Jugg": ["tungnd27", "huynq101", "quangpnt1"],
    "Riki": ["datpt45", "loinc1", "thainvq2"],
    "Alchemist": ["hieutt45", "longln4", "ducnt118"],
    "Invoker": ["tungnt108", "sonnt87", "huynhpt5"]
}

def find_schedule_by_date(num_days):
    target_squads = initial_squads[-num_days % len(initial_squads):] + initial_squads[:-num_days % len(initial_squads)]
    return target_squads

# Function to get the current shift index
def get_detail_shift(target_datetime, shift):
    shifts = ["1:00", "9:00", "13:00", "17:00", "21:00", "23:59"]
    num_days = target_datetime - start_schedule

    target_schedule = find_schedule_by_date(num_days.days)
    if shift is None:
        if str(target_datetime.time()) == '00:00:00':
            response = f" - ".join(target_schedule[:5])
        else:
            current_shift = 5
            for i in range(len(shifts) - 1):
                start_time = datetime.strptime(shifts[i], "%H:%M").time()
                end_time = datetime.strptime(shifts[i + 1], "%H:%M").time()

                if start_time <= target_datetime.time() < end_time:
                    current_shift =  i
            response = f"<code>{target_schedule[current_shift]}</code> - <b>{', '.join(squads_members[target_schedule[current_shift]])}</b>"
        return response
    else:
        response = f"<code>{target_schedule[shift]}</code> - <b>{', '.join(squads_members[target_schedule[shift]])}</b>"
        return response

def handle_now_command(update: Update, context: CallbackContext) -> None:
    response = get_detail_shift(datetime.now(), None)
    update.message.reply_text(f"Current squad and members: {response}", parse_mode='HTML')

def handle_today_command(update: Update, context: CallbackContext) -> None:
    today = datetime.now().date()
    shift = None
    try:
        content = context.args[0]
        if content in ['shift1', 'shift2', 'shift3', 'shift4', 'shift5']:
            shift = int(re.search(r'\d+', content).group()) - 1
            time_string = "00:00"
        else:
            time_string = context.args[0]
    except Exception as e:
        time_string = "00:00"
    time_object = datetime.strptime(time_string, "%H:%M").time()

    target_datetime = datetime.combine(today, time_object)
    response = get_detail_shift(target_datetime, shift)
    if str(target_datetime.time()) == '00:00:00' and shift is None:
        update.message.reply_text(f"The duty schedule for today: <code>{response}</code>", parse_mode='HTML')
    elif shift is not None:
        update.message.reply_text(f"The duty schedule for today at shift{shift+1}: {response}", parse_mode='HTML')
    else:
        update.message.reply_text(f"The duty schedule for today at {time_string}: {response}", parse_mode='HTML')

def handle_shift_schedule_command(update: Update, context: CallbackContext) -> None:
    date_string = context.args[0]
    shift = None
    try:
        content = context.args[1]
        if content in ['shift1', 'shift2', 'shift3', 'shift4', 'shift5']:
            shift = int(re.search(r'\d+', content).group()) - 1
            time_string = "00:00"
        else:
            time_string = context.args[1]
    except Exception as e:
        time_string = "00:00"
    date_object = datetime.strptime(date_string, "%d/%m/%Y").date()
    time_object = datetime.strptime(time_string, "%H:%M").time()

    target_datetime = datetime.combine(date_object, time_object)
    response = get_detail_shift(target_datetime, shift)
    if str(target_datetime.time()) == '00:00:00' and shift is None:
        update.message.reply_text(f"The duty schedule on {target_datetime.strftime('%d/%m/%Y')}: <code>{response}</code>", parse_mode='HTML')
    elif shift is not None:
        update.message.reply_text(f"The duty schedule on {target_datetime.strftime('%d/%m/%Y')} at shift{shift+1}: {response}", parse_mode='HTML')
    else:
        update.message.reply_text(f"Squad and members on {target_datetime.strftime('%d/%m/%Y at %H:%M')}: {response}", parse_mode='HTML')


def main() -> None:
    updater = Updater("6955047594:AAFFOQmjqPH2YUtT49eQ5Hkp1z38wD_X3Co", use_context=True)
    dispatcher = updater.dispatcher

    dispatcher.add_handler(CommandHandler("now", handle_now_command))
    dispatcher.add_handler(CommandHandler("today", handle_today_command))
    dispatcher.add_handler(CommandHandler("shift_schedule", handle_shift_schedule_command))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
