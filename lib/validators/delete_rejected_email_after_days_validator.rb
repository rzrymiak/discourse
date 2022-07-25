# frozen_string_literal: true

class DeleteRejectedEmailAfterDaysValidator
  def initialize(opts = {})
    @opts = opts
  end

  def valid_value?(value)
    @valid = value.to_i >= SiteSetting.delete_email_logs_after_days && value.to_i <= 36500
  end

  def error_message
    I18n.t("site_settings.errors.delete_rejected_email_after_days") if !@valid
  end
end
