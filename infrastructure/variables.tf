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

variable "family" {
  default     = "C"
  description = "The SKU family/pricing group to use. Valid values are `C` (for Basic/Standard SKU family) and `P` (for Premium). Use P for higher availability, but beware it costs a lot more."
}

variable "sku_name" {
  default     = "Basic"
  description = "The SKU of Redis to use. Possible values are `Basic`, `Standard` and `Premium`."
}

variable "capacity" {
  default     = "1"
  description = "The size of the Redis cache to deploy. Valid values are 1, 2, 3, 4, 5"
}

variable "managed_redis_sku" {
  description = "Managed Redis SKU. Override per environment in <env>.tfvars."
  type        = string
  default     = "Balanced_B0"
}

variable "managed_redis_high_availability_enabled" {
  description = "Managed Redis high availability. Override per environment in <env>.tfvars."
  type        = bool
  default     = false
}

variable "managed_redis_persistence_rdb_backup_frequency" {
  description = "Managed Redis persistence RDB backup frequency. Override per environment in <env>.tfvars."
  type        = string
  default     = null
}