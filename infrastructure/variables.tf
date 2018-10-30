variable "product" {
  type    = "string"
}

variable "component" {
  type   = "string"
}

variable "location" {
  type    = "string"
  default = "UK South"
}

variable "env" {
  type = "string"
}

variable "infrastructure_env" {
  default     = "dev"
  description = "Infrastructure environment to point to"
}

variable "subscription" {
  type = "string"
}

variable "ilbIp"{}

variable "additional_hostname" {
  default = "sscs-cor.sandbox.platform.hmcts.net"
}

variable "common_tags" {
  type = "map"
}

variable "secure_session" {
  description = "Whether a secure session is required"
  default     = "true"
}

variable "idam_url" {
  description = "url to redirect to for login via idam"
}

variable "idam_api_url" {
  description = "url for idam api"
}

variable "idam_enable_stub" {
  description = "Mount idam stub routes on the app or not"
  default = "false"
}

variable "evidence_upload_question_page_enabled" {
  description = "Feature switch for evidence upload per question",
  default = "false"
}

variable "evidence_upload_question_page_override_allowed" {
  description = "Feature switch for enabling evidence upload per question to be enabled using a cookie",
  default = "false"
}
