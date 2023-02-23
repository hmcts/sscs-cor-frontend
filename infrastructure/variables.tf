variable "product" {
}

variable "component" {
}

variable "location" {
  default = "UK South"
}

variable "env" {
}

variable "node_environment" {
  default     = "dev"
  description = "Infrastructure environment to point to"
}

variable "subscription" {
}

variable "common_tags" {
  type = map(string)
}